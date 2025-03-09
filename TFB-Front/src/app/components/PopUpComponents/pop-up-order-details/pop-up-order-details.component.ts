import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import * as moment from 'moment';

@Component({
  selector: 'app-pop-up-order-details',
  templateUrl: './pop-up-order-details.component.html',
  styleUrls: ['./pop-up-order-details.component.css'],
})
export class PopUpOrderDetailsComponent implements OnInit {
  public deliveryDate: any;
  public visaNumber: string = '';
  public street: string = '';
  public city: string = '';
  public totalPrice: number;

  constructor(
    public dialogRef: MatDialogRef<PopUpOrderDetailsComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { items: any; fullPrice: number }
  ) {
    this.deliveryDate = moment().format('YYYY-MM-DD');
    this.totalPrice = data.fullPrice + 30; // Default delivery fee
  }

  buyNow(): void {
    if (!this.city || !this.street || !this.visaNumber) {
      alert('Please fill all fields!');
      return;
    }
    this.dialogRef.close({
      visaNumber: this.visaNumber.slice(-4), // Get last 4 digits
      deliveryDate: this.deliveryDate,
      city: this.city,
      street: this.street,
      total_price: this.totalPrice,
    });
  }

  ngOnInit() {}
}
