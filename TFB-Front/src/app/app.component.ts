import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/Home/login/login.component';
import getPayload from './serverServices/Payload/getPayload';
import { CategoryService } from './serverServices/categoryService/category.service';
import { ProductService } from './serverServices/productService/product.service';
import { Router } from '@angular/router';
import getIsAdmin from '../app/serverServices/Payload/isAdmin';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'The Fog Bank';
  public token: any = '';
  public isAdmin: any;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    this.isAdmin = getIsAdmin();
    console.log(this.isAdmin, ' :ADMIN');
  }
}
