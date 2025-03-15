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
  ice: number = 0; // Ice level
  nic: number = 0; // Nicotine level
  selectedOption: string = ''; // Store selected option

  constructor(
    public dialogRef: MatDialogRef<QuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private cartService: CartService
  ) {}

  ngOnInit() {
    console.log(`📌 Opening Quantity Dialog for: ${this.data.product.name}`);
    console.log(`🔍 Received Product Data:`, this.data.product);

    if (this.data.product.quantity === undefined) {
      console.warn(
        `⚠ Warning: Product "${this.data.product.name}" is missing quantity!`
      );
      this.data.product.quantity = 0;
    }

    this.selectedOption = this.data.product.details?.options?.[0]?.option || ''; // Default to first option
    this.checkExistingQuantity();
  }

  async checkExistingQuantity() {
    console.log(
      '🛒 Checking existing quantity for product:',
      this.data.product._id
    );

    const cartItems = await this.cartService.getCartItems();
    console.log('🛒 Cart Items:', cartItems);

    // ✅ Find the exact match for product & selected option
    const existingItem = cartItems.find(
      (item: any) =>
        String(item.product_id?._id || item.product_id) ===
          String(this.data.product._id) &&
        (item.option || '') === (this.selectedOption || '')
    );

    if (existingItem) {
      this.existingQuantity = existingItem.amount;
      this.quantity = this.existingQuantity; // ✅ Show correct quantity from cart
      this.ice = existingItem.ice || 0;
      this.nic = existingItem.nic || 0;
    } else {
      this.existingQuantity = 0;
      this.quantity = 1; // ✅ Reset to 1 if option is not in cart
    }

    this.updateMaxAvailableQuantity();
  }

  updateMaxAvailableQuantity() {
    if (this.data.product.details?.options?.length > 0) {
      const selectedOptionDetails = this.data.product.details.options.find(
        (opt: any) => opt.option === this.selectedOption
      );

      this.maxAvailableQuantity = selectedOptionDetails
        ? selectedOptionDetails.quantity
        : 0;
    } else {
      this.maxAvailableQuantity = this.data.product.quantity;
    }

    this.maxAllowed = this.maxAvailableQuantity;
    console.log('🛒 Max Stock:', this.maxAvailableQuantity);
  }

  adjustValue(type: string, amount: number) {
    if (type === 'quantity') {
      if (
        this.quantity + amount >= 1 &&
        this.quantity + amount <= this.maxAllowed
      ) {
        this.quantity += amount;
      }
    } else if (type === 'ice') {
      if (this.ice + amount >= 0 && this.ice + amount <= 10) {
        this.ice += amount;
      }
    } else if (type === 'nic') {
      if (this.nic + amount >= 0 && this.nic + amount <= 20) {
        this.nic += amount;
      }
    }
  }

  onSliderChange() {
    console.log('🛒 Quantity changed via slider:', this.quantity);
  }

  selectOption(option: string) {
    console.log(`🎨 Changing selected option to: ${option}`);

    this.selectedOption = option; // ✅ Update selected option
    this.existingQuantity = 0; // ✅ Reset quantity before checking
    this.quantity = 1; // ✅ Reset quantity to avoid previous value conflicts

    this.updateMaxAvailableQuantity(); // ✅ Update available stock for new option

    // ✅ Wait for `selectedOption` to update before checking cart
    setTimeout(() => {
      this.checkExistingQuantity(); // ✅ Now fetch correct cart quantity
    }, 100);
  }

  confirmSelection() {
    console.log('🛒 Confirming selection:', {
      quantity: this.quantity,
      ice: this.ice,
      nic: this.nic,
      option: this.selectedOption,
    });

    if (this.quantity > this.maxAllowed) {
      alert(`❌ Maximum allowed quantity is ${this.maxAllowed}`);
      return;
    }

    this.dialogRef.close({
      quantity: this.quantity,
      ice: this.ice,
      nic: this.nic,
      option: this.selectedOption,
    });
  }
}
