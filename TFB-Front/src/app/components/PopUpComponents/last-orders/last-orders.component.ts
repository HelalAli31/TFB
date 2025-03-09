import { Component, Inject, OnInit } from '@angular/core';
import { OrdersService } from 'src/app/service/orderService/orders.service';
import getPayload from 'src/app/service/Payload/getPayload';
import * as moment from 'moment';
import { CartService } from 'src/app/service/cartService/cart.service';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-last-orders',
  templateUrl: './last-orders.component.html',
  styleUrls: ['./last-orders.component.css'],
})
export class LastOrdersComponent implements OnInit {
  public user: any;
  public selectedOrder: any;
  public Orders: any;
  public dates: any = [];
  public selectedCart: string = '';
  public items: any;
  public filterItems: any;
  public totalPrice: number = 0;

  constructor(
    private ordersService: OrdersService,
    private cartService: CartService,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public dialogRef: MatDialogRef<LastOrdersComponent>
  ) {}

  async getLastOrders() {
    this.Orders = await this.ordersService.getAllOrders(this.user._id);
    this.Orders.order.map((o: any) => {
      this.dates.push({
        date: moment(o.order_date).format('MMM Do YY'),
        cartId: o.cart_id,
      });
    });
    console.log(this.dates[0].date);
    this.selectedCart = this.dates[0].date;
  }

  filterDates(cartId: any) {
    this.filterItems = this.items[cartId];
    console.log(this.filterItems);
    this.updateTotalPrice();
  }

  updateTotalPrice() {
    this.totalPrice = 0;
    this.filterItems.map((item: any) => {
      this.totalPrice += item.full_price;
    });
  }

  async getCartItems() {
    this.items = await this.cartService.getCartItems(this.dates);
  }

  ItemsSelected() {
    this.dialogRef.close({
      data: this.filterItems,
    });
  }
  async ngOnInit() {
    const user = getPayload();
    this.user = user.data[0];
    await this.getLastOrders();
    await this.getCartItems();
    await this.filterDates(0);
  }
}
