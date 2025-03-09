import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/serverServices/cart/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  public cartId: string = ''; // Holds the cart ID
  public cartItems: any[] = []; // Array to store cart items
  public totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  async ngOnInit() {
    console.log('🛒 Initializing CartComponent...');

    const userId = this.getUserId();
    if (!userId) {
      console.error('🚨 User ID is missing! You must be logged in.');
      return;
    }

    try {
      console.log(`📤 Requesting cart for User ID: ${userId}`);

      const cartResponse: any = await this.cartService.getCart(userId);
      console.log('📥 Cart Response:', cartResponse);

      if (
        !cartResponse ||
        !cartResponse.cart ||
        cartResponse.cart.length === 0
      ) {
        console.warn('🚨 No active cart found for user.');
        return;
      }

      this.cartId = cartResponse.cart[cartResponse.cart.length - 1]._id;
      console.log('✅ Cart ID retrieved:', this.cartId);

      await this.loadCartItems();
    } catch (error) {
      console.error('❌ Error fetching cart ID:', error);
    }
  }

  getUserId(): string | null {
    const token = localStorage.getItem('token');
    console.log('TOKEN:', token);
    if (!token) {
      console.error('🚨 No token found in localStorage!');
      return null;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      console.log('🔍 Extracted Token Payload:', payload);

      return payload?.data?.[0]?._id || payload?.user_id || payload?.id || null;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return null;
    }
  }

  // 🔄 Fetch the latest cart ID
  async getCartId() {
    try {
      console.log('🔄 Fetching latest cart ID...');
      const userToken = localStorage.getItem('token');
      if (!userToken) {
        console.warn('🚨 No user token found. Redirecting to login...');
        return;
      }

      const cartResponse: any = await this.cartService.getCart(userToken);
      if (cartResponse && cartResponse.cart.length > 0) {
        this.cartId = cartResponse.cart[cartResponse.cart.length - 1]._id;
        console.log('✅ Cart ID:', this.cartId);
      } else {
        console.warn('⚠️ No cart found.');
      }
    } catch (error) {
      console.error('❌ Error fetching cart ID:', error);
    }
  }

  // 🛒 Fetch Cart Items
  async loadCartItems() {
    try {
      if (!this.cartId) {
        console.warn('🚨 No cart ID available. Cannot load items.');
        return;
      }

      console.log(`📤 Fetching items for cart: ${this.cartId}`);
      const response = await this.cartService.getCartItems(this.cartId);

      if (Array.isArray(response)) {
        this.cartItems = response.map((item: any) => ({
          ...item,
          amount: item.amount || 1, // ✅ Ensure amount is properly set
        }));
      } else {
        console.warn('⚠️ No items found in cart.');
        this.cartItems = [];
      }

      console.log('✅ cartItems:', this.cartItems);
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  }

  // 🔼 Increase Quantity
  async increaseQuantity(index: number) {
    const item = this.cartItems[index];
    item.amount++; // ✅ Use the correct field: 'amount'

    try {
      console.log(`➕ Increasing quantity for item: ${item._id}`);
      await this.cartService.editItemAmount(
        item._id,
        item.amount,
        item.product_id.price * item.amount
      );
      this.updateTotalPrice();
      console.log('✅ Quantity increased successfully!');
    } catch (error) {
      console.error('❌ Error increasing quantity:', error);
      item.amount--; // ❌ Rollback on failure
    }
  }

  // 🔽 Decrease Quantity
  async decreaseQuantity(index: number) {
    const item = this.cartItems[index];
    if (item.amount > 1) {
      item.amount--; // ✅ Use the correct field: 'amount'

      try {
        console.log(`➖ Decreasing quantity for item: ${item._id}`);
        await this.cartService.editItemAmount(
          item._id,
          item.amount,
          item.product_id.price * item.amount
        );
        this.updateTotalPrice();
        console.log('✅ Quantity decreased successfully!');
      } catch (error) {
        console.error('❌ Error decreasing quantity:', error);
        item.amount++; // ❌ Rollback on failure
      }
    }
  }

  // 🛒 Remove Item from Cart
  async removeItem(index: number) {
    try {
      const item = this.cartItems[index];

      console.log(`🗑 Removing item with ID: ${item._id}`);
      await this.cartService.deleteItemFromCart(item._id);

      this.cartItems.splice(index, 1); // Remove from UI
      this.updateTotalPrice();
      console.log('✅ Item removed from cart!');
    } catch (error) {
      console.error('❌ Error removing item:', error);
    }
  }
  async updateQuantity(index: number) {
    try {
      const item = this.cartItems[index];
      if (item.amount < 1) {
        item.amount = 1; // ✅ Prevents invalid values
      }

      console.log(`✏️ Updating quantity for item: ${item._id}`);

      // Update the quantity in the backend
      const response: any = await this.cartService.editItemAmount(
        item._id,
        item.amount,
        item.product_id.price * item.amount
      );

      // Ensure UI updates properly with the correct response format
      if (response && response.updatedCartItem) {
        this.cartItems[index] = {
          ...this.cartItems[index],
          amount: response.updatedCartItem.amount, // ✅ Show updated quantity
          full_price: response.updatedCartItem.full_price, // ✅ Show updated total price
        };
      } else {
        console.warn('⚠️ No updated item received, manually updating UI.');
        this.cartItems[index].amount = item.amount;
      }

      this.updateTotalPrice();
      console.log('✅ Quantity updated successfully and saved in DB!');
    } catch (error) {
      console.error('❌ Error updating quantity:', error);
    }
  }

  getTotalPrice(): number {
    console.log('🛍 Calculating total price...');
    return this.cartItems.reduce((total, item) => {
      if (!item.amount || isNaN(item.amount)) {
        console.warn('⚠️ Amount is missing or invalid for:', item);
        item.amount = 1; // ✅ Default to 1 if missing
      }

      if (
        !item.product_id ||
        !item.product_id.price ||
        isNaN(item.product_id.price)
      ) {
        console.error('❌ Price is missing or invalid for:', item);
        return total; // ✅ Skip this item if price is invalid
      }

      const itemTotal = item.product_id.price * item.amount;
      console.log(
        `🛒 Item: ${item.product_id.name}, Price: ${item.product_id.price}, Amount: ${item.amount}, Total: ${itemTotal}`
      );

      return total + itemTotal;
    }, 0);
  }

  // ✅ Update Total Price
  updateTotalPrice() {
    this.totalPrice = this.getTotalPrice();
  }
}
