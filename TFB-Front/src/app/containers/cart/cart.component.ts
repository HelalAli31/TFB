import { Component, OnInit } from '@angular/core';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { environment } from '../../../environments/environment'; // Import environment
import { PopUpOrderDetailsComponent } from 'src/app/components/PopUpComponents/pop-up-order-details/pop-up-order-details.component';
import { OrderService } from 'src/app/serverServices/order/order.service';
import { MatDialog } from '@angular/material/dialog';
import getPayload from 'src/app/serverServices/Payload/getPayload';
import { LanguageService } from 'src/app/serverServices/language.service';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
})
export class CartComponent implements OnInit {
  public cartItems: any[] = [];
  public totalPrice: number = 0;
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment
  public bundleDiscounts: {
    categoryId: string;
    name: string;
    discount: number;
  }[] = [];

  specialCategoryPricing: any = {
    '67759289eca0466ca85bfac3': [
      { quantity: 3, price: 130 },
      { quantity: 5, price: 200 },
    ],
    '67759289eca0466ca85bfaba': [
      { quantity: 2, price: 160 },
      { quantity: 3, price: 230 },
      { quantity: 4, price: 300 },
    ],
  };

  constructor(
    private cartService: CartService,
    private orderService: OrderService,
    public dialog: MatDialog,
    public languageService: LanguageService
  ) {}

  async ngOnInit() {
    console.log('🛒 Initializing CartComponent...', getPayload());
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
        console.log(this.cartItems[0].product_id.category);
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

    // Check if we're already using the default image to prevent infinite loop
    if (event.target.src.includes('default.jpg')) {
      console.log('🛑 Already using default image, stopping error handling');
      return;
    }

    // Check if we're using a color variation and need to try the base image
    if (
      event.target.src.includes('_') &&
      !event.target.src.includes('default.jpg')
    ) {
      // Try the base product image without color variation
      const baseImage = `${this.apiUrl}/assets/products/${product.name}.jpg`;
      console.log(`🔄 Trying base image: ${baseImage}`);

      // Set a flag to track that we've already tried the fallback
      event.target.setAttribute('data-tried-fallback', 'true');
      event.target.src = baseImage;
      return;
    }

    // If we get here, both the color variation and base image failed
    // or we're not using a color variation - use default image
    console.log('❌ Using default image as final fallback');
    event.target.src = `${this.apiUrl}/assets/products/default.jpg`;
  }
  updateTotalPrice() {
    console.log('🧮 Recalculating total price...');
    const categoryGroups: { [categoryId: string]: any[] } = {};
    this.bundleDiscounts = [];

    // Group cart items by category
    this.cartItems.forEach((item) => {
      const catId = item.product_id?.category;
      if (!categoryGroups[catId]) categoryGroups[catId] = [];
      categoryGroups[catId].push(item);
    });

    let total = 0;

    for (const [categoryId, items] of Object.entries(categoryGroups)) {
      const pricingRules = this.specialCategoryPricing[categoryId];
      const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

      if (pricingRules) {
        const sortedRules = [...pricingRules].sort(
          (a, b) => b.quantity - a.quantity
        );
        let remaining = totalAmount;
        let categoryTotal = 0;
        let basePrice = Math.min(
          ...items.map((item) =>
            this.isSaleActive(item.product_id)
              ? item.product_id.sale.salePrice
              : item.product_id.price
          )
        );

        const fullPrice = totalAmount * basePrice;

        for (const rule of sortedRules) {
          while (remaining >= rule.quantity) {
            remaining -= rule.quantity;
            categoryTotal += rule.price;
          }
        }

        if (remaining > 0) {
          categoryTotal += remaining * basePrice;
        }

        const saved = fullPrice - categoryTotal;
        if (saved > 0) {
          console.log('ITEEMMMM', items[0]);
          const categoryName =
            items[0].product_id.category == '67759289eca0466ca85bfaba'
              ? 'TFB 120ml'
              : 'Salt';
          ('Category');
          this.bundleDiscounts.push({
            categoryId,
            name: categoryName,
            discount: saved,
          });
        }

        total += categoryTotal;
      } else {
        for (const item of items) {
          const unitPrice = this.isSaleActive(item.product_id)
            ? item.product_id.sale.salePrice
            : item.product_id.price;
          total += unitPrice * item.amount;
        }
      }
    }

    this.totalPrice = total;
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

  // Open order dialog
  openOrderDialog() {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    const dialogRef = this.dialog.open(PopUpOrderDetailsComponent, {
      width: '900px',
      data: {
        items: this.cartItems,
        fullPrice: this.totalPrice,
        bundleDiscounts: this.bundleDiscounts,
      },
      disableClose: true,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.processOrder(result);
      }
    });
  }

  // Process the order
  async processOrder(orderDetails: any) {
    try {
      const cartId = await this.cartService.getCartId(); // should return ObjectId string
      console.log('CARRRRRT ID :', cartId);
      const userId = getPayload().data._id;

      if (!userId || !cartId || !orderDetails.visaNumber) {
        alert('Missing user, cart, or visa information.');
        return;
      }

      const orderData = {
        user_id: userId,
        cart_id: cartId,
        total_price: orderDetails.total_price,
        city: orderDetails.city,
        street: orderDetails.street,
        payment: 'visa',
        delivery_way: orderDetails.isDelivery ? 'delivery' : 'pickup',
        last_visa_number: Number(orderDetails.visaNumber),
      };

      const response = await this.orderService.addOrder(orderData).toPromise();
      console.log(response);
      if (response.order) {
        alert('✅' + response.message);
        this.cartItems = [];
        this.totalPrice = 0;
        this.bundleDiscounts = [];
        window.location.reload();
      } else {
        alert('❌Failed to place order. Please try again.');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      alert('An error occurred while processing your order.');
    }
  }
}
