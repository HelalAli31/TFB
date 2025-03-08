import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private apiUrl = 'http://localhost:5000/cart';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: localStorage.getItem('token') || '',
    });
  }

  getCart(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = { userId };
    return this.http.post(`${this.apiUrl}/`, {}, { headers, params });
  }

  updateCartStatus(cartId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = { cartId };
    return this.http.post(
      `${this.apiUrl}/updateOpenedCartStatus`,
      {},
      { headers, params }
    );
  }

  addCart(userId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = { userId };
    return this.http.post(`${this.apiUrl}/addCart`, {}, { headers, params });
  }

  getCartItems(cartId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { cartId };
    return this.http.post(`${this.apiUrl}/getItems`, body, { headers });
  }

  addItemToCart(item: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { item };
    return this.http.put(`${this.apiUrl}/AddItems`, body, { headers });
  }

  deleteItemFromCart(itemId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = { itemId };
    return this.http.put(`${this.apiUrl}/deleteItem`, {}, { headers, params });
  }

  clearCart(cartId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const params = { cartId };
    return this.http.put(`${this.apiUrl}/clearCart`, {}, { headers, params });
  }

  editItemAmount(
    itemId: string,
    amount: number,
    fullPrice: number
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { data: { itemId, amount, fullPrice } };
    return this.http.post(`${this.apiUrl}/editItemAmount`, body, { headers });
  }
}
