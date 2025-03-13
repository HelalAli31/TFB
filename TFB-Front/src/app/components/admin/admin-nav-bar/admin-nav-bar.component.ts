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
  getProductImage(product: any): string {
    if (!product || !product.name) {
      console.log('❌ No product found, using default image.');
      return 'assets/products/default.jpg';
    }
    return `assets/products/${product.name}.jpg`; // Try first image (name.jpg)
  }

  // Handle Image Fallback
  onImageError(event: any, product: any) {
    // If product or color details are missing, use the default image
    if (!product || !product.details || !product.details.color?.length) {
      console.log('⚠️ No product color found, using default image.');
      event.target.src = 'assets/products/default.jpg';
      return;
    }

    const color = product.details.color[0]?.color;
    if (!color) {
      console.log('⚠️ Color missing, using default image.');
      event.target.src = 'assets/products/default.jpg';
      return;
    }

    const fallbackImage = `assets/products/${product.name}_${color}.jpg`;
    console.log(`🔄 Trying fallback image: ${fallbackImage}`);

    // Create a new Image object to pre-check if the fallback image exists
    const img = new Image();
    img.src = fallbackImage;
    img.onload = () => {
      event.target.src = fallbackImage;
    };
    img.onerror = () => {
      console.log('❌ Both images missing, using default.');
      event.target.src = 'assets/products/default.jpg';
    };
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
