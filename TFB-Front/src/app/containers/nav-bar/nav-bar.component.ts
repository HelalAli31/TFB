import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginComponent } from '../../components/Home/login/login.component';
import getPayload from '../../serverServices/Payload/getPayload';
import { CategoryService } from '../../serverServices/categoryService/category.service';
import { ProductService } from '../../serverServices/productService/product.service';
import { Router } from '@angular/router';
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
