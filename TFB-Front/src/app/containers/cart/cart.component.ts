import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { environment } from '../../../environments/environment'; // Import environment

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  public cartItems: any[] = [];
  public totalPrice: number = 0;
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

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

  // Get max available quantity (use option quantity if available)
  getMaxAvailableQuantity(item: any): number {
    if (item.option && item.product_id?.details?.options) {
      const selectedOption = item.product_id.details.options.find(
        (opt: any) => opt.option === item.option
      );
      return selectedOption?.quantity || item.product_id.quantity;
    }
    return item.product_id.quantity;
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

  async onSliderChange(index: number) {
    const item = this.cartItems[index];
    const maxAvailableQuantity = this.getMaxAvailableQuantity(item);

    if (item.amount > maxAvailableQuantity) {
      item.amount = maxAvailableQuantity;
    }
    await this.updateItemInDb(item);
    this.updateTotalPrice();
  }

  async updateItemInDb(item: any) {
    try {
      console.log(`🛒 Updating item in DB for item: ${item._id}`);
      await this.cartService.editItemAmount(
        item._id,
        item.amount,
        item.product_id.price * item.amount,
        item.nic,
        item.ice
      );
      console.log('✅ Item updated in DB!');
    } catch (error) {
      console.error('❌ Error updating item in DB:', error);
    }
  }
  async updateNicIce(item: any, type: string) {
    await this.updateItemInDb(item);
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
  getProductImage(item: any): string {
    if (!item || !item.product_id)
      return `${this.apiUrl}/assets/products/default.jpg`;

    if (item.option) {
      return `${this.apiUrl}/assets/products/${item.product_id.name}_${item.option}.jpg`;
    }

    return `${this.apiUrl}/assets/products/${item.product_id.name}.jpg`;
  }

  // ✅ Handle Image Fallback if Not Found
  onImageError(event: any, product: any) {
    console.log(`⚠️ Image failed to load: ${event.target.src}`);

    // Check for color variation
    if (product?.details?.options?.length > 0) {
      const option = product.details.options[0]?.option;
      if (option) {
        const fallbackImage = `${this.apiUrl}/assets/products/${product.name}_${option}.jpg`;
        console.log(`🔄 Trying fallback image: ${fallbackImage}`);

        event.target.src = fallbackImage; // Try alternative image
        return;
      }
    }

    // ✅ Final fallback to default image
    console.log('❌ Both images missing, using default.');
    event.target.src = `${this.apiUrl}/assets/products/default.jpg`;
  }
  updateTotalPrice() {
    this.totalPrice = this.cartItems.reduce((total, item) => {
      const product = item.product_id;
      const unitPrice = this.isSaleActive(product)
        ? product.sale.salePrice
        : product.price;
      return total + unitPrice * item.amount;
    }, 0);
  }

  isSaleActive(product: any): boolean {
    if (!product?.sale?.isOnSale) return false; // Sale must be enabled

    const currentDate = new Date();
    const startDate = new Date(product.sale.saleStartDate);
    const endDate = new Date(product.sale.saleEndDate);

    return startDate <= currentDate && currentDate <= endDate;
  }

  getTotalPrice(): number {
    return this.totalPrice;
  }
}
