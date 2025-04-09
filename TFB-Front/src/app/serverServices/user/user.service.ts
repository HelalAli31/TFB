import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import getPayload from '../Payload/getPayload';
import { environment } from '../../../environments/environment'; // Import environment

const apiUrlBase = environment.apiUrl; // ✅ Set API base URL from environment

const USER_URL = apiUrlBase + '/Auth/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  public token: any;
  public firstName: any;
  constructor(private httpService: HttpClient) {}

  login(username: string, password: string) {
    return this.httpService
      .post(`${USER_URL}login`, { username, password })
      .toPromise()
      .catch((error) => {
        console.error('❌ Login Error:', error);
        return { msg: 'Invalid username or password. Please try again.' }; // Return a user-friendly message
      });
  }
  async changePassword(
    userId: string,
    oldPassword: string,
    newPassword: string
  ) {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('🚨 No token found in localStorage.');
      throw new Error('Unauthorized: No token provided.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`,
    });

    const requestBody = {
      userId: userId,
      old_password: oldPassword, // ✅ Ensure these match the backend variable names
      new_password: newPassword,
    };

    console.log('📩 Sending change password request:', requestBody);

    try {
      const response = await this.httpService
        .post(`${USER_URL}changePassword`, requestBody, { headers })
        .toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error changing password:', error);
      throw error;
    }
  }

  signUP(userForm: any): Promise<any> {
    return this.httpService
      .post<{ message: string; user?: any }>(`${USER_URL}register`, userForm)
      .toPromise()
      .catch((error) => {
        console.error('❌ Signup Error:', error);
        return {
          message: error?.error?.message || 'Signup failed. Try again.',
        };
      });
  }

  async getUserProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('🚨 No token found in localStorage.');
      throw new Error('Unauthorized: No token provided.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ Prefix with 'Bearer '
    });

    try {
      return await this.httpService
        .get(`${USER_URL}profile`, { headers })
        .toPromise();
    } catch (error) {
      console.error('❌ Error fetching user profile:', error);
      throw error;
    }
  }

  // 🔥 **Update User Profile with Authorization**
  async updateUserProfile(userId: string, updatedData: any) {
    const token = localStorage.getItem('token');

    if (!token) {
      console.error('🚨 No token found in localStorage.');
      throw new Error('Unauthorized: No token provided.');
    }

    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // ✅ Ensure correct token format
    });

    try {
      const response = await this.httpService
        .post(
          `${USER_URL}updateUser`,
          { userId, updateData: updatedData },
          { headers }
        )
        .toPromise();
      return response;
    } catch (error) {
      console.error('❌ Error updating user:', error);
      throw error;
    }
  }

  sendContactMessage(
    name: string,
    email: string,
    message: string
  ): Promise<any> {
    const payload = { name, email, message };

    return this.httpService
      .post(`${environment.apiUrl}/send-email`, payload)
      .toPromise()
      .catch((error) => {
        console.error('❌ Error sending contact email:', error);
        return {
          success: false,
          message: 'Failed to send message. Please try again later.',
        };
      });
  }
}
