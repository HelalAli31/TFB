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
    if (product.details?.options && product.details.options.length > 0) {
      const option = product.details.options[0]?.option; // Get first option
      if (option) {
        return `${this.apiUrl}/assets/products/${product.name}_${option}.jpg`;
      }
    }

    // ✅ Default case: product without options
    return `${this.apiUrl}/assets/products/${product.name}.jpg`;
  }

  // ✅ Handle Image Fallback if Not Found
  onImageError(event: any, product: any) {
    console.log(`⚠️ Image failed to load: ${event.target.src}`);

    // Check if we're already using the default image to prevent infinite loop
    if (event.target.src.includes('default.jpg')) {
      console.log('🛑 Already using default image, stopping error handling');
      return;
    }

    // Check if we're using a color variation and need to try the base image
    if (
      event.target.src.includes('_') &&
      !event.target.src.includes('default.jpg')
    ) {
      // Try the base product image without color variation
      const baseImage = `${this.apiUrl}/assets/products/${product.name}.jpg`;
      console.log(`🔄 Trying base image: ${baseImage}`);

      // Set a flag to track that we've already tried the fallback
      event.target.setAttribute('data-tried-fallback', 'true');
      event.target.src = baseImage;
      return;
    }

    // If we get here, both the color variation and base image failed
    // or we're not using a color variation - use default image
    console.log('❌ Using default image as final fallback');
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
