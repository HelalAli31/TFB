import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoryService {
  private apiUrl = 'http://localhost:5000/category';

  constructor(private http: HttpClient) {}

  private getAuthHeaders(): HttpHeaders {
    return new HttpHeaders({
      Authorization: localStorage.getItem('token') || '',
    });
  }

  getCategories(): Observable<any> {
    const headers = this.getAuthHeaders();
    return this.http.post(`${this.apiUrl}`, {}, { headers });
  }

  getCategoryById(categoryId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { categoryId };
    return this.http.post(`${this.apiUrl}/byId`, body, { headers });
  }

  addCategory(categoryName: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { categoryName };
    return this.http.post(`${this.apiUrl}/addCategory`, body, { headers });
  }

  updateCategory(categoryId: string, name: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { categoryId, name };
    return this.http.post(`${this.apiUrl}/updateCategoryById`, body, {
      headers,
    });
  }

  deleteCategory(categoryId: string): Observable<any> {
    const headers = this.getAuthHeaders();
    const body = { categoryId };
    return this.http.post(`${this.apiUrl}/deleteCategory`, body, { headers });
  }
}
