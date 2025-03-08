import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/Home/login/login.component';
import getPayload from './serverServices/Payload/getPayload';
import { CategoryService } from './serverServices/categoryService/category.service';
import { ProductService } from './serverServices/productService/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'clinic';
  public token: any = '';
  public categories: { name: string }[] = []; // Categories should be objects
  isCategoriesVisible = false;
  hoveredCategory: string | null = null;
  categoryTimeout: any;
  searchValue: string = '';
  searchResults: any[] = [];
  isSearchVisible: boolean = false;

  constructor(
    public dialog: MatDialog,
    private catService: CategoryService,
    private productService: ProductService,
    private router: Router
  ) {}

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
