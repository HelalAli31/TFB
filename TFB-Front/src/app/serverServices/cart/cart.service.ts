import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

const CART_URL = 'http://localhost:5000/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  public subject = new Subject<any>();

  constructor(private httpService: HttpClient) {}
  getCart(userId: string) {
    let token = localStorage.getItem('token');
    if (!token) {
      console.error('🚨 No token found in localStorage!');
      throw new Error('Missing Authorization Token');
    }

    token = token.replace(/^"(.*)"$/, '$1'); // ✅ Remove surrounding double quotes

    console.log(`📤 Sending request with token: ${token}`);

    return this.httpService
      .post(
        `${CART_URL}?userId=${userId}`,
        {}, // Empty request body
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`, // ✅ Ensure correct format
          }),
        }
      )
      .toPromise();
  }

  async getCartItems(cartId: string): Promise<any[]> {
    const token = localStorage.getItem('token');
    if (!token) return [];

    try {
      const result = await this.httpService
        .get<any[]>(`${CART_URL}/getItems?cartId=${cartId}`, {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
        })
        .toPromise();

      return Array.isArray(result) ? result : [];
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
      return [];
    }
  }

  editItemAmount(itemId: string, amount: number, fullPrice: number) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('🚨 Missing token! Cannot update item quantity.');
      return;
    }

    return this.httpService
      .post(
        `${CART_URL}/editItemAmount`,
        { data: { fullPrice, amount, itemId } }, // Ensure correct payload
        {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        }
      )
      .toPromise()
      .then((response) => {
        console.log('✅ Quantity Updated in Backend:', response);
        return response;
      })
      .catch((error) => console.error('❌ Update Failed:', error));
  }

  deleteItemFromCart(itemId: string) {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('🚨 Missing token! Cannot delete item.');
      return;
    }

    return this.httpService
      .put(
        `${CART_URL}/deleteItem?itemId=${itemId}`,
        {}, // Empty body
        {
          headers: new HttpHeaders({
            Authorization: `Bearer ${token}`,
          }),
          responseType: 'json',
        }
      )
      .toPromise()
      .then((response) => {
        console.log('✅ Item Deleted:', response);
        this.subject.next(response);
      })
      .catch((error) => console.error('❌ Delete Failed:', error));
  }
}
