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
      this.updateTotalPrice(); // Call the updateTotalPrice method after loading the cart items
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  }

  async loadCartItems() {
    try {
      const response = await this.cartService.getCartItems();
      if (Array.isArray(response)) {
        this.cartItems = response.map((item: any) => ({
          ...item,
          amount: item.amount || 1,
        }));
      } else {
        console.warn('⚠️ No items found in cart.');
        this.cartItems = [];
      }
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  }

  // Calculate max available quantity based on available stock
  getMaxAvailableQuantity(item: any): number {
    return item.product_id?.quantity; // Max quantity = available stock
  }

  // Increase Quantity Function
  async increaseQuantity(index: number) {
    const item = this.cartItems[index];
    const maxQuantity = item.product_id?.quantity;

    if (item.amount < maxQuantity) {
      item.amount++;
      await this.updateItemInDb(item); // Save the updated item to the DB
      this.updateTotalPrice();
    }
  }

  // Decrease Quantity Function
  async decreaseQuantity(index: number) {
    const item = this.cartItems[index];
    if (item.amount > 1) {
      item.amount--;
      await this.updateItemInDb(item); // Save the updated item to the DB
      this.updateTotalPrice();
    }
  }

  // Slider Input Change Handler
  async onSliderChange(index: number) {
    const item = this.cartItems[index];
    const maxAvailableQuantity = this.getMaxAvailableQuantity(item);

    if (item.amount > maxAvailableQuantity) {
      item.amount = maxAvailableQuantity; // Prevent exceeding max quantity
    }
    await this.updateItemInDb(item); // Save the updated item to the DB
    this.updateTotalPrice();
  }

  // Function to update the item in the database
  async updateItemInDb(item: any) {
    try {
      console.log(`🛒 Updating item in DB for item: ${item._id}`);
      await this.cartService.editItemAmount(
        item._id,
        item.amount,
        item.product_id.price * item.amount
      );
      console.log('✅ Item updated in DB!');
    } catch (error) {
      console.error('❌ Error updating item in DB:', error);
    }
  }

  // Remove Item from Cart
  async removeItem(index: number) {
    try {
      const item = this.cartItems[index];
      console.log(`🗑 Removing item with ID: ${item._id}`);
      await this.cartService.deleteItemFromCart(item._id);

      // Remove the item from the cart items list
      this.cartItems.splice(index, 1);
      this.updateTotalPrice();
      console.log('✅ Item removed from cart!');
    } catch (error) {
      console.error('❌ Error removing item:', error);
    }
  }

  updateTotalPrice() {
    this.totalPrice = this.cartItems.reduce((total, item) => {
      return total + item.product_id.price * item.amount;
    }, 0);
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }
}
