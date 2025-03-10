import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CartService } from 'src/app/serverServices/cart/cart.service';

@Component({
  selector: 'app-quantity-dialog',
  templateUrl: './quantity-dialog.component.html',
  styleUrls: ['./quantity-dialog.component.css'],
})
export class QuantityDialogComponent {
  quantity: number = 1; // Default quantity
  existingQuantity: number = 0; // Existing quantity in the cart
  maxAvailableQuantity: number = 0; // Max user can have (stock constraint)
  maxAllowed: number = 0; // Max including existing cart quantity

  constructor(
    public dialogRef: MatDialogRef<QuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cartService: CartService
  ) {}

  async ngOnInit() {
    await this.checkExistingQuantity();
  }

  async checkExistingQuantity() {
    console.log(
      '🛒 Checking existing quantity for product:',
      this.data.product._id
    );

    const cartItems = await this.cartService.getCartItems();
    console.log('🛒 Cart Items:', cartItems);

    // Find if the product is already in the cart
    const existingItem = cartItems.find(
      (item: any) =>
        String(item.product_id?._id || item.product_id) ===
        String(this.data.product._id)
    );

    if (existingItem) {
      this.existingQuantity = existingItem.amount;
      this.quantity = this.existingQuantity; // Set default to what they already have
    } else {
      this.existingQuantity = 0; // Not found, assume 0 in cart
    }

    // Maximum they can have in total = stock constraint
    this.maxAvailableQuantity = this.data.product.quantity;
    this.maxAllowed = this.maxAvailableQuantity; // Total allowed stock

    console.log('🛒 Existing Quantity:', this.existingQuantity);
    console.log('🛒 Product Stock:', this.data.product.quantity);
    console.log('🛒 Maximum Allowed (Stock Constraint):', this.maxAllowed);

    // Prevent overflow: If they already have max allowed, restrict selection
    if (this.existingQuantity >= this.maxAllowed) {
      this.quantity = this.maxAllowed;
    }
  }

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      console.log('🛒 Decreased quantity:', this.quantity);
    }
  }

  increaseQuantity() {
    if (this.quantity < this.maxAllowed) {
      this.quantity++;
      console.log('🛒 Increased quantity:', this.quantity);
    } else {
      alert(`❌ You cannot add more than ${this.maxAllowed} of this product.`);
      console.log('🛒 Max reached, no increase in quantity.');
    }
  }

  onSliderChange() {
    console.log('🛒 Quantity changed via slider:', this.quantity);
  }

  confirmSelection() {
    console.log('🛒 Confirming selection with quantity:', this.quantity);
    this.dialogRef.close(this.quantity);
  }
}
