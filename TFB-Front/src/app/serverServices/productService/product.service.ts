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
  getProducts(
    page: number = 1,
    limit: number = 50,
    sortBy: string = 'name',
    order: string = 'asc',
    keyName?: string,
    valueName?: string
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { page, limit, sortBy, order, keyName, valueName };
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
