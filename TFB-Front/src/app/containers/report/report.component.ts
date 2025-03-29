import { Component, OnInit } from '@angular/core';
import { OrderService } from 'src/app/serverServices/order/order.service';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.css'],
})
export class ReportComponent implements OnInit {
  allOrders: any[] = [];
  expandedOrderId: string | null = null;
  orderItemsMap: { [key: string]: any[] } = {};
  public isAdmin: any;

  constructor(
    private orderService: OrderService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.isAdmin = getIsAdmin();

    this.loadAllOrders();
  }

  loadAllOrders(): void {
    this.orderService.getAllOrders().subscribe({
      next: (res) => {
        this.allOrders = res.orders || [];
        console.log('✅ All Orders:', this.allOrders);
      },
      error: (err) => {
        console.error('❌ Failed to load orders:', err);
      },
    });
  }

  async toggleOrderDetails(orderId: string, cartId: string) {
    if (this.expandedOrderId === orderId) {
      this.expandedOrderId = null;
      return;
    }

    this.expandedOrderId = orderId;

    if (!this.orderItemsMap[orderId]) {
      const items = await this.cartService.getCartItems(cartId);
      this.orderItemsMap[orderId] = items || [];
    }
  }
}
