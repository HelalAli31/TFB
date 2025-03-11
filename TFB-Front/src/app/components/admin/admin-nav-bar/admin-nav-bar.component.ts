import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { LoginComponent } from '../../Home/login/login.component';

@Component({
  selector: 'app-admin-nav-bar',
  templateUrl: './admin-nav-bar.component.html',
  styleUrls: ['./admin-nav-bar.component.css'],
})
export class AdminNavBarComponent implements OnInit {
  searchValue: string = '';
  public token: any = '';

  searchResults: any[] = [];
  isSearchVisible: boolean = false;
  constructor(
    public dialog: MatDialog,
    private productService: ProductService
  ) {}
  logOut() {
    localStorage.removeItem('token');
    window.location.reload();
  }
  openDialog(): void {
    this.dialog.open(LoginComponent, {
      data: { title: 'All items ' },
    });
  }

  searchProducts() {
    if (this.searchValue.trim().length === 0) {
      this.isSearchVisible = false;
      return;
    }

    this.productService.getProducts().subscribe((data: any) => {
      if (Array.isArray(data.products)) {
        this.searchResults = data.products.filter((product: any) =>
          product.name.toLowerCase().includes(this.searchValue.toLowerCase())
        );
      } else {
        console.error('Unexpected API response format:', data);
        this.searchResults = [];
      }

      this.isSearchVisible = this.searchResults.length > 0;
    });
  }
  hideSearch() {
    setTimeout(() => {
      this.isSearchVisible = false;
    }, 300);
  }

  ngOnInit(): void {
    this.token = localStorage.getItem('token') || '';
  }
}
