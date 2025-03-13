import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { LoginComponent } from '../../Home/login/login.component';
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-admin-nav-bar',
  templateUrl: './admin-nav-bar.component.html',
  styleUrls: ['./admin-nav-bar.component.css'],
})
export class AdminNavBarComponent implements OnInit {
  searchValue: string = '';
  public token: any = '';
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

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

  // Handle Image Fallback
  getProductImage(product: any): string {
    if (!product || !product.name) {
      console.log('❌ No product found, using default image.');
      return `${this.apiUrl}/assets/products/default.jpg`; // Use default image
    }

    // ✅ Check if product has colors
    if (product.details?.color && product.details.color.length > 0) {
      const color = product.details.color[0]?.color; // Get first color
      if (color) {
        return `${this.apiUrl}/assets/products/${product.name}_${color}.jpg`;
      }
    }

    // ✅ Default case: product without colors
    return `${this.apiUrl}/assets/products/${product.name}.jpg`;
  }

  // ✅ Handle Image Fallback if Not Found
  onImageError(event: any, product: any) {
    console.log(`⚠️ Image failed to load: ${event.target.src}`);

    // Check for color variation
    if (product?.details?.color?.length > 0) {
      const color = product.details.color[0]?.color;
      if (color) {
        const fallbackImage = `${this.apiUrl}/assets/products/${product.name}_${color}.jpg`;
        console.log(`🔄 Trying fallback image: ${fallbackImage}`);

        event.target.src = fallbackImage; // Try alternative image
        return;
      }
    }

    // ✅ Final fallback to default image
    console.log('❌ Both images missing, using default.');
    event.target.src = `${this.apiUrl}/assets/products/default.jpg`;
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
