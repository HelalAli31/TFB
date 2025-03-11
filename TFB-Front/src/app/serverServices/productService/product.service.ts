import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ProductService {
  private apiUrl = 'http://localhost:5000/products';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: localStorage.getItem('token') || '',
    });
  }
  // product.service.ts
  getProductById(id: string): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/${id}`, { headers });
  }

  getProducts(
    page: number = 1,
    limit: number = 10, // ✅ Default to 10 per page
    sortBy: string = 'name',
    order: string = 'asc',
    keyName?: string,
    valueName?: string,
    isSearch: boolean = false // ✅ New flag to control pagination
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { page, limit, sortBy, order, keyName, valueName, isSearch };
    return this.http.post(`${this.apiUrl}/`, body, { headers });
  }

  getTopProducts(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}/topProducts`, { headers });
  }

  addProduct(product: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { product };
    return this.http.post(`${this.apiUrl}/addProduct`, body, { headers });
  }
  deleteTopProduct(productId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { productId };
    return this.http.post(`${this.apiUrl}/deleteTopProduct`, body, { headers });
  }
  addTopProduct(productId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { productId };
    return this.http.post(`${this.apiUrl}/addTopProduct`, body, { headers });
  }

  updateProduct(product: any): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { product };
    return this.http.post(`${this.apiUrl}/updateProduct`, body, { headers });
  }

  deleteProduct(productId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { productId };
    return this.http.post(`${this.apiUrl}/deleteProduct`, body, { headers });
  }

  getProductsNumber(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/productsNumber`, { headers });
  }
}
