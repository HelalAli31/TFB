import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-quantity-dialog',
  templateUrl: './quantity-dialog.component.html',
  styleUrls: ['./quantity-dialog.component.css'],
})
export class QuantityDialogComponent {
  quantity: number = 1; // Default quantity

  constructor(
    public dialogRef: MatDialogRef<QuantityDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {}

  decreaseQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
    }
  }

  increaseQuantity() {
    if (this.quantity < this.data.product.quantity) {
      this.quantity++;
    }
  }

  confirmSelection() {
    this.dialogRef.close(this.quantity);
  }
}
