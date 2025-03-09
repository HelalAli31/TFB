import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from 'src/app/service/cartService/cart.service';
import getPayload from 'src/app/service/Payload/getPayload';
import { MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { OrdersService } from 'src/app/service/orderService/orders.service';
import * as moment from 'moment';

@Component({
  selector: 'app-pop-up-login',
  templateUrl: './pop-up-login.component.html',
  styleUrls: ['./pop-up-login.component.css'],
})
export class PopUpLoginComponent implements OnInit {
  public userId: any;
  public cart: any;
  public cartIsOpen: Boolean;
  public lastOrderDate: string;
  public OpenedCartDetails: any;
  public NewUser: string;
  public userName: any;

  constructor(
    private cartService: CartService,
    private orderService: OrdersService,
    private router: Router,

    private bottomSheetRef: MatBottomSheetRef<PopUpLoginComponent>
  ) {
    this.userId = [];
    this.cart = [];
    this.cartIsOpen = false;
    this.lastOrderDate = '';
    this.OpenedCartDetails = {};
    this.NewUser = '';
    this.userName = {};
  }
  NavigateClick() {
    this.router.navigate([`/products/${this.cart[this.cart.length - 1]._id}`]);
    this.bottomSheetRef.dismiss();
  }
  async openCart() {
    if (this.userId) {
      const cartAdded = await this.createCart();
      if (cartAdded) {
        this.router.navigate([`/products/${this.cart}`]);
        this.bottomSheetRef.dismiss();
      } else {
        alert('something went wrong!sorry.');
        return;
      }
    } else {
      alert('user is not found!!');
      return;
    }
  }

  async createCart() {
    let cartIsAdded = false;
    const newCart = await this.cartService.addCart(this.userId).then(
      (value: any) => {
        if (value.data) {
          this.cart = value.data[0]._id;
          cartIsAdded = true;
        }
      },
      (reason: any) => {
        alert(reason);
        cartIsAdded = false;
      }
    );
    return cartIsAdded;
  }

  async getLastOrderDate(cartId: string) {
    await this.orderService.getOrder(cartId).then(
      (value: any) => {
        console.log(value);
        this.lastOrderDate = moment(
          value.order[value.order.length - 1].order_date
        ).format('DD/MM/YYYY');
      },
      (reason: any) => {
        alert(reason);
      }
    );
  }
  async getOpenedCartDetails(data: any) {
    let totalCartPrice = 0;
    await this.cartService.getCartItems(data._id)?.then(
      (value: any) => {
        value.map((item: any) => {
          totalCartPrice += item.full_price;
        });
      },
      (reason: any) => {
        alert(reason);
        return;
      }
    );
    this.OpenedCartDetails.totalPrice = totalCartPrice;
    this.OpenedCartDetails.date = moment(data.date).format('DD/MM/YYYY');
    console.log(this.OpenedCartDetails.date);
  }

  async getCart() {
    const result = await this.cartService.getCart(this.userId).then(
      (value: any) => {
        const data = value.cart[value.cart.length - 1];
        if (data) {
          this.cartIsOpen = data.cartIsOpen;
          this.cart = value.cart;
          console.log(this.cart);
          if (this.cartIsOpen === false) {
            this.getLastOrderDate(data._id);
          } else {
            console.log(data, value);
            this.getOpenedCartDetails(data);
          }
        } else {
          this.NewUser = 'Welcome to our supermarket.';
        }
      },
      (reason: any) => {
        alert(reason);
      }
    );
  }

  async ngOnInit() {
    const userResult = await getPayload();
    this.userId = userResult.data[0]._id;
    this.userName.firstName = userResult.data[0].first_name;
    this.userName.lastName = userResult.data[0].last_name;
    if (!this.userId) return;
    this.getCart();
  }
}
