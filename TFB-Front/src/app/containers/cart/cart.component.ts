import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/serverServices/cart/cart.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  public cartItems: any[] = [];
  public totalPrice: number = 0;

  constructor(private cartService: CartService) {}

  async ngOnInit() {
    console.log('🛒 Initializing CartComponent...');

    try {
      await this.loadCartItems();
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  }

  // 🛒 Fetch Cart Items
  async loadCartItems() {
    try {
      const response = await this.cartService.getCartItems();

      if (Array.isArray(response)) {
        this.cartItems = response.map((item: any) => ({
          ...item,
          amount: item.amount || 1, // Ensure amount is properly set
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
    item.amount++;

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
      item.amount--; // Rollback on failure
    }
  }

  // 🔽 Decrease Quantity
  async decreaseQuantity(index: number) {
    const item = this.cartItems[index];
    if (item.amount > 1) {
      item.amount--;

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
        item.amount++; // Rollback on failure
      }
    }
  }

  // 🛒 Remove Item from Cart
  async removeItem(index: number) {
    try {
      const item = this.cartItems[index];
      console.log(`🗑 Removing item with ID: ${item._id}`);
      await this.cartService.deleteItemFromCart(item._id);

      this.cartItems.splice(index, 1);
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
        item.amount = 1;
      }

      console.log(`✏️ Updating quantity for item: ${item._id}`);
      const response: any = await this.cartService.editItemAmount(
        item._id,
        item.amount,
        item.product_id.price * item.amount
      );

      if (response && response.updatedCartItem) {
        this.cartItems[index] = {
          ...this.cartItems[index],
          amount: response.updatedCartItem.amount,
          full_price: response.updatedCartItem.full_price,
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
    return this.cartItems.reduce((total, item) => {
      if (!item.amount || isNaN(item.amount)) {
        console.warn('⚠️ Amount is missing or invalid for:', item);
        item.amount = 1;
      }

      let finalPrice = item.product_id?.price || 0;

      if (item.product_id?.sale?.isOnSale) {
        finalPrice = item.product_id.sale.salePrice;
      }

      const itemTotal = finalPrice * item.amount;

      return total + itemTotal;
    }, 0);
  }

  updateTotalPrice() {
    this.totalPrice = this.getTotalPrice();
  }
}
