import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
const USER_URL = 'http://localhost:5000/Auth/';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private httpService: HttpClient) {}
  login(username: string, password: string) {
    console.log(username, password);
    const result = this.httpService
      .post(`${USER_URL}login`, { username, password })
      .toPromise();

    return result;
  }
  signUP(userForm: any) {
    const { phone, password, first_name, last_name } = userForm;
    const result = this.httpService
      .post(`${USER_URL}register`, {
        values: { phone, password, first_name, last_name },
      })
      .toPromise();
    return result;
  }
}
