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
    limit: number = 30, // ✅ Default to 10 per page
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
    const headers = this.getAuthHeaders(); // Ensure headers are properly set
    return this.http.post(`${this.apiUrl}/topProducts`, {}, { headers }); // ✅ Fix: Pass headers correctly
  }

  addProduct(
    product: any,
    mainImage: File | null,
    colorImages: { [color: string]: File } | null
  ): Observable<any> {
    const headers = this.getAuthHeaders();
    const formData = new FormData();

    formData.append('name', product.name);
    formData.append('brand', product.brand);
    formData.append('category', product.category);
    formData.append('price', product.price);
    formData.append('quantity', product.quantity);
    formData.append('description', product.description);

    // ✅ Ensure `details` is a valid JSON object
    if (product.details && Object.keys(product.details).length > 0) {
      formData.append('details', JSON.stringify(product.details));
    }

    // ✅ Append Main Image if Available
    if (mainImage) {
      console.log('🖼️ Attaching main image:', mainImage.name);
      formData.append('image', mainImage);
    } else {
      console.log('⚠️ No main image provided.');
    }

    // ✅ Append Color Images Correctly
    if (colorImages && Object.keys(colorImages).length > 0) {
      console.log('🎨 Attaching color images...');
      Object.entries(colorImages).forEach(([color, file]) => {
        if (file) {
          console.log(`🔹 Attaching color: ${color}, Filename: ${file.name}`);
          formData.append('colorImages', file, `${color}.jpg`); // ✅ Correct format
        }
      });
    } else {
      console.log('⚠️ No color images provided.');
    }

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
  updateProduct(productId: string, formData: FormData): Observable<any> {
    const headers = new HttpHeaders({
      Authorization: localStorage.getItem('token') || '',
    });

    return this.http
      .put(`${this.apiUrl}/updateProduct/${productId}`, formData, {
        headers,
      })
      .pipe(
        tap((response: any) => {
          if (!response.success) {
            console.error('❌ Server returned an error:', response.message);
            throw new Error(response.message || 'Unknown server error');
          }
        }),
        catchError((error: any) => {
          console.error('❌ HTTP Error Response:', error);
          return throwError(
            () => new Error(error.error?.message || 'Failed to update product')
          );
        })
      );
  }

  // ✅ Delete a specific option image
  deleteOptionImage(productId: string, option: string): Observable<any> {
    return this.http.delete(
      `${this.apiUrl}/deleteOptionImage/${productId}/${option}`,
      {
        headers: this.getAuthHeaders(),
      }
    );
  }

  deleteProduct(productId: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/deleteProduct/${productId}`, {
      headers: this.getAuthHeaders(),
    });
  }

  getProductsNumber(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/productsNumber`, { headers });
  }
}
