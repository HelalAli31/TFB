import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const CART_URL = 'http://localhost:5000/cart';

@Injectable({
  providedIn: 'root',
})
export class CartService {
  private cartUpdated = new BehaviorSubject<any[]>([]);
  cartUpdated$ = this.cartUpdated.asObservable();
  private cartId: string | null = null; // ✅ Cache open cart ID

  constructor(private httpService: HttpClient) {}

  async getCartId(): Promise<string> {
    if (this.cartId) return this.cartId; // ✅ Use cached open cart ID

    const token = this.getToken();
    if (!token) {
      console.error('🚨 No token found. Cannot fetch cart.');
      return '';
    }

    try {
      console.log('📤 Checking open cart...');
      const userId = this.getUserId();
      if (!userId) return '';

      let response: any = await this.getCart(userId);

      if (response?.cart) {
        console.log(`✅ Found open cart: ${response.cart._id}`);
        this.cartId = response.cart._id;
        return response.cart._id;
      }

      console.error('❌ No open cart received from backend.');
      return '';
    } catch (error) {
      console.error('❌ Error fetching cart:', error);
      return '';
    }
  }

  // 🛒 **Get User’s Open Cart**
  getCart(userId: string) {
    const token = this.getToken();
    if (!token) return Promise.reject('No token found.');

    return this.httpService
      .post(
        `${CART_URL}?userId=${userId}`,
        {},
        {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        }
      )
      .toPromise();
  }

  async getCartItems(): Promise<any[]> {
    const token = this.getToken();
    if (!token) return [];

    const cartId = await this.getCartId();
    if (!cartId) {
      console.error('❌ No cart ID found, cannot fetch cart items.');
      return [];
    }

    try {
      console.log(`📤 Fetching cart items for cart ID: ${cartId}`);
      const response = await this.httpService
        .get<any[]>(`${CART_URL}/getItems?cartId=${cartId}`, {
          headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
        })
        .toPromise();

      if (!response || response.length === 0) {
        console.warn(`⚠️ No cart items found for cart ID: ${cartId}`);
        return []; // ✅ Return an empty array instead of `undefined`
      }

      console.log('✅ Cart items received:', response);
      this.cartUpdated.next(response || []);
      return response;
    } catch (error: any) {
      if (error.status === 404) {
        console.warn(`⚠️ No cart items found for cart ID: ${cartId}`);
        return [];
      }
      console.error(`❌ Error fetching cart items for ${cartId}:`, error);
      return [];
    }
  }

  async addItemToCart(cartItem: any): Promise<void> {
    const token = this.getToken();
    if (!token) throw new Error('No token found.');

    const cartId = await this.getCartId();
    if (!cartId) {
      console.error('🚨 No active cart found.');
      return;
    }

    cartItem.cart_id = cartId;

    try {
      console.log('📤 Sending request to add item:', cartItem);

      const response: any = await this.httpService
        .put(
          `${CART_URL}/AddItems`,
          { item: cartItem },
          {
            headers: new HttpHeaders({
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            }),
          }
        )
        .toPromise();

      console.log('✅ Item added successfully! Response:', response);

      if (response && response.message) {
        alert(`✅ ${cartItem.amount}x ${cartItem.name} added to cart!`);
        this.refreshCart();
      } else {
        console.error('🚨 Unexpected response format:', response);
        alert('❌ Failed to add item to cart. Unexpected response.');
      }
    } catch (error: any) {
      console.error('❌ Error adding item:', error);
      alert(`❌ Failed to add item: ${error.message || 'Unknown error'}`);
    }
  }

  // 🔄 **Refresh Cart**
  async refreshCart() {
    const cartId = await this.getCartId();
    if (!cartId) return;

    const updatedItems = await this.getCartItems();
    this.cartUpdated.next(updatedItems || []);
  }

  // ✏️ **Edit Item Amount**
  async editItemAmount(itemId: string, amount: number, fullPrice: number) {
    const token = this.getToken();
    if (!token) return;

    try {
      await this.httpService
        .post(
          `${CART_URL}/editItemAmount`,
          { data: { fullPrice, amount, itemId } },
          {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
          }
        )
        .toPromise();

      console.log('✅ Quantity Updated in Backend');
      this.refreshCart();
    } catch (error) {
      console.error('❌ Update Failed:', error);
    }
  }

  // 🗑 **Remove Item from Cart**
  async deleteItemFromCart(itemId: string) {
    const token = this.getToken();
    if (!token) return;

    try {
      await this.httpService
        .put(
          `${CART_URL}/deleteItem?itemId=${itemId}`,
          {},
          {
            headers: new HttpHeaders({ Authorization: `Bearer ${token}` }),
            responseType: 'json',
          }
        )
        .toPromise();

      console.log('✅ Item Deleted');
      this.refreshCart();
    } catch (error) {
      console.error('❌ Delete Failed:', error);
    }
  }

  // 🆔 **Get User ID from Token**
  // 🆔 **Get User ID from Token**
  getUserId(): string | undefined {
    const token = this.getToken();
    if (!token) {
      console.error('🚨 No token found in localStorage.');
      return undefined;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode JWT
      console.log('🔍 Extracted Token Payload:', payload);

      const userId = payload?.data?.[0]?._id || payload?.user_id || payload?.id;

      if (!userId) {
        console.error('🚨 Extracted User ID is undefined or invalid!', payload);
        return undefined;
      }

      return userId;
    } catch (error) {
      console.error('❌ Error decoding token:', error);
      return undefined;
    }
  }

  // 🔑 **Get Token**
  getToken(): string | null {
    let token = localStorage.getItem('token');
    return token ? token.replace(/^"(.*)"$/, '$1') : null;
  }
}
