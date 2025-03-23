import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment'; // Import environment

const apiUrlBase = environment.apiUrl; // ✅ Set API base URL from environment

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = apiUrlBase + '/category';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('token');
    return new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ Fix: Add 'Bearer' prefix
    });
  }

  getCategories(): Observable<any> {
    return this.http.get(`${this.apiUrl}`);
  }

  // ✅ Add Category with Image Upload
  addCategory(categoryName: string, image: File): Observable<any> {
    const formData = new FormData();
    formData.append('categoryName', categoryName);
    formData.append('image', image);

    return this.http.post(`${this.apiUrl}/addCategory`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  // ✅ Update Category (Supports Image Update)
  updateCategory(
    categoryId: string,
    categoryName: string,
    image?: File
  ): Observable<any> {
    const formData = new FormData();
    formData.append('categoryId', categoryId);
    formData.append('categoryName', categoryName);
    if (image) formData.append('image', image);

    return this.http.post(`${this.apiUrl}/updateCategory`, formData, {
      headers: this.getAuthHeaders(),
    });
  }

  deleteCategory(categoryId: string): Observable<any> {
    return this.http.post(
      `${this.apiUrl}/deleteCategory`,
      { categoryId },
      { headers: this.getAuthHeaders() }
    );
  }
}
