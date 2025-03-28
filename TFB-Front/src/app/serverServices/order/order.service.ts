import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Import environment

const apiUrlBase = environment.apiUrl; // ✅ Set API base URL from environment

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  private apiUrl = apiUrlBase + '/orders';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ Fix: Add 'Bearer' prefix
    });
  }

  getOrder(cartId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = { cartId };
    return this.http.post(`${this.apiUrl}/`, {}, { headers, params });
  }

  addOrder(order: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { order };
    return this.http.post(`${this.apiUrl}/addOrder`, body, { headers });
  }

  getOrdersNumber(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/getOrdersNumber`, { headers });
  }

  getAllOrders(userId?: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = userId ? { userId } : {};
    return this.http.post(`${this.apiUrl}/All`, body, { headers });
  }

  deleteOrder(orderId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { orderId };
    return this.http.delete(`${this.apiUrl}/deleteOrder`, { headers, body });
  }

  updateOrder(orderId: string, updateData: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { orderId, updateData };
    return this.http.put(`${this.apiUrl}/updateOrder`, body, { headers });
  }
}
