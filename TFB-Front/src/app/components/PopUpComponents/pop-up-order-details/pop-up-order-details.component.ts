// pop-up-order-details.component.ts
import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import * as moment from 'moment';

@Component({
  selector: 'app-pop-up-order-details',
  templateUrl: './pop-up-order-details.component.html',
  styleUrls: ['./pop-up-order-details.component.css'],
})
export class PopUpOrderDetailsComponent implements OnInit {
  public visaNumber: string = '';
  public street: string = '';
  public city: string = '';
  public totalPrice: number;
  public fullPrice: number;
  public deliveryPrice: number = 30; // Default delivery fee
  public isDelivery: boolean = true;
  public filteredItems: any[] = [];
  public filterModel: string = '';
  public minDate = new Date();
  public images = {
    delivery: 'assets/images/delivery.png',
    pickUp: 'assets/images/pickup.png',
  };

  constructor(
    public dialogRef: MatDialogRef<PopUpOrderDetailsComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: {
      items: any[];
      fullPrice: number;
      bundleDiscounts: any[];
    }
  ) {
    this.fullPrice = data.fullPrice;
    this.totalPrice = data.fullPrice + this.deliveryPrice;
    this.filteredItems = [...data.items];
  }

  ngOnInit() {
    // Initialize with all items
    this.filterOperation();
  }

  InvalidDatesFilter = (d: Date | null): boolean => {
    const day = (d || new Date()).getDay();
    // Prevent Saturday and Sunday from being selected
    return day !== 0 && day !== 6;
  };

  updatePrice(isDelivery: string) {
    this.isDelivery = isDelivery === 'true';
    this.deliveryPrice = this.isDelivery ? 30 : 0;
    this.totalPrice = this.fullPrice + this.deliveryPrice;
  }

  filterOperation() {
    if (!this.filterModel || this.filterModel.trim() === '') {
      this.filteredItems = [...this.data.items];
    } else {
      const searchTerm = this.filterModel.toLowerCase();
      this.filteredItems = this.data.items.filter((item) =>
        item.product_id.title.toLowerCase().includes(searchTerm)
      );
    }
  }

  buyNow(): void {
    if (!this.city || !this.street || !this.visaNumber) {
      alert('Please fill all fields!');
      return;
    }

    if (this.visaNumber.length < 4) {
      alert('Please enter at least 4 digits of your visa number');
      return;
    }

    this.dialogRef.close({
      visaNumber: String(this.visaNumber).slice(-4),
      city: this.city,
      street: this.street,
      isDelivery: this.isDelivery,
      total_price: this.totalPrice,
    });
  }
}
