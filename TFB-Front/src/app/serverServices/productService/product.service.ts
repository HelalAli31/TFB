import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
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
  addProduct(
    product: any,
    mainImage: File | null,
    colorImages: { [color: string]: File }
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('brand', product.brand);
    formData.append('category', product.category);
    formData.append('price', product.price);
    formData.append('quantity', product.quantity);
    formData.append('description', product.description);

    // ✅ Convert `details` to JSON before appending
    formData.append('details', JSON.stringify(product.details));

    // ✅ Only append main image if it exists
    if (mainImage) {
      formData.append('image', mainImage);
    }

    // ✅ Append Color Images in a way that the backend can correctly parse them
    console.log('🖼️ Appending color images to FormData...');
    Object.entries(colorImages).forEach(([color, file]) => {
      console.log(`🔹 Attaching color: ${color}, Filename: ${file.name}`);
      formData.append('colorImages', file, `${color}.jpg`); // Attach file with its color name
    });

    console.log('\n📩 FormData before sending:');
    formData.forEach((value, key) => {
      console.log(`${key}:`, value);
    });

    return this.http
      .post(`${this.apiUrl}/addProduct`, formData, { headers })
      .pipe(
        tap((response: any) => {
          console.log('✅ SERVER RESPONSE:', response);
          if (!response.success) {
            console.error('❌ Server returned an error:', response.error);
            throw new Error(response.error || 'Unknown server error');
          }
        }),
        catchError((error: any) => {
          console.error('❌ HTTP Error Response:', error);
          if (error.error) {
            console.error('📌 Backend Response:', error.error);
          }
          return throwError(
            () => new Error(error.error?.message || 'Failed to add product')
          );
        })
      );
  }

  deleteTopProduct(productId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { productId };
    return this.http.post(`${this.apiUrl}/deleteTopProduct`, body, { headers });
  }
  uploadProductImage(file: File): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: localStorage.getItem('token') || '',
    });

    const formData = new FormData();
    formData.append('image', file);

    return this.http.post(`${this.apiUrl}/upload-product-image`, formData, {
      headers,
    });
  }

  addTopProduct(productId: string): Observable<any> {
    console.log('ADDING TO TOPPP');
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
