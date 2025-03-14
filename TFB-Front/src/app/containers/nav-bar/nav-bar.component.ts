import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginComponent } from '../../components/Home/login/login.component';
import getPayload from '../../serverServices/Payload/getPayload';
import { CategoryService } from '../../serverServices/categoryService/category.service';
import { ProductService } from '../../serverServices/productService/product.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'; // Import environment

@Component({
  selector: 'app-nav-bar',
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.css'],
})
export class NavBarComponent implements OnInit {
  title = 'TFB';
  public token: any = '';
  public categories: { name: string }[] = []; // Categories should be objects
  isCategoriesVisible = false;
  hoveredCategory: string | null = null;
  categoryTimeout: any;
  searchValue: string = '';
  searchResults: any[] = [];
  isSearchVisible: boolean = false;
  isMenuOpen: boolean = false; // Define isMenuOpen state
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

  constructor(
    public dialog: MatDialog,
    private catService: CategoryService,
    private productService: ProductService,
    private router: Router
  ) {}

  toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen; // Toggle menu state
  }
  filterProducts(category: string, customerType: string) {
    let queryParams: any = { category };

    if (customerType) {
      queryParams.customerType = customerType;
    }

    this.router.navigate(['/products'], { queryParams });
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

  async joined() {
    const data = await getPayload();
    console.log(data);
  }

  openDialog(): void {
    this.dialog.open(LoginComponent, {
      data: { title: 'All items ' },
    });
  }

  logOut() {
    localStorage.removeItem('token');
    window.location.reload();
  }

  onImageCateError(event: any) {
    event.target.src = this.apiUrl + '/assets/categories/default.jpg';
  }
  getProductImage(product: any): string {
    console.log(' ,P:', product.name);

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
    console.log('PKKK:', product);

    // Check for color variation

    // ✅ Final fallback to default image
    console.log('❌ Both images missing, using default.');
    event.target.src = `${this.apiUrl}/assets/products/default.jpg`;
  }

  showCategories() {
    clearTimeout(this.categoryTimeout);
    this.isCategoriesVisible = true;
  }

  delayedHideCategories() {
    this.categoryTimeout = setTimeout(() => {
      this.isCategoriesVisible = false;
    }, 500);
  }

  showLabels(categoryName: string) {
    this.hoveredCategory = categoryName; // Store only category name as string
  }

  hideLabels() {
    this.hoveredCategory = null;
  }

  getCategories() {
    this.catService.getCategories().subscribe(
      (categories: any[]) => {
        this.categories = categories.map((category) => ({
          name: category.name,
        }));
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    this.getCategories();
  }
}
