import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';

import { LoginComponent } from '../../components/Home/login/login.component';
import getPayload from '../../serverServices/Payload/getPayload';
import { CategoryService } from '../../serverServices/categoryService/category.service';
import { ProductService } from '../../serverServices/productService/product.service';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment'; // Import environment
import { CartService } from 'src/app/serverServices/cart/cart.service';

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
  public cartItems: any[] = [];
  public firstName: string = ''; // Store user's first name

  constructor(
    public dialog: MatDialog,
    private catService: CategoryService,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
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
    localStorage.removeItem('name');
    window.location.reload();
  }

  onImageCateError(event: any) {
    event.target.src = this.apiUrl + '/assets/categories/default.jpg';
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

    // Check for color variation
    if (product?.details?.options?.length > 0) {
      const option = product.details.options[0]?.option;
      if (option) {
        const fallbackImage = `${this.apiUrl}/assets/products/${product.name}_${option}.jpg`;
        console.log(`🔄 Trying fallback image: ${fallbackImage}`);

        event.target.src = fallbackImage; // Try alternative image
        return;
      }
    }

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

  // In your NavBarComponent
  getCategories() {
    this.catService.getCategories().subscribe(
      (categories: any[]) => {
        console.log('🔍 Raw categories from API:', categories);
        this.categories = categories.map((category) => ({
          name: category.name,
        }));
        console.log('🔍 Processed categories:', this.categories);

        // Log category names for easier debugging
        console.log(
          '🔍 Category names:',
          this.categories.map((c) => c.name)
        );
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
      }
    );
  }
  filterByCategory(category: string) {
    // Close the dropdown
    this.isCategoriesVisible = false;

    // Log the category
    console.log('🔍 Navigating to category:', category);

    // Use window.location.href for a full page navigation
    window.location.href = `/products?category=${encodeURIComponent(category)}`;
  }

  logCategoryClick(category: any) {
    console.log('🔍 Clicked on category:', category);
    console.log(
      '🔍 Available categories in nav:',
      this.categories.map((c) => c.name)
    );
  }

  async loadCartItems() {
    try {
      const response = await this.cartService.getCartItems();
      if (Array.isArray(response)) {
        this.cartItems = response;
      } else {
        console.warn('⚠️ No items found in cart.');
        this.cartItems = [];
      }
    } catch (error) {
      console.error('❌ Error fetching cart items:', error);
    }
  }
  getTotalCartItems(): number {
    return this.cartItems.reduce(
      (total, item) => total + (item.amount || 1),
      0
    );
  }

  async ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    if (this.token) {
      const payload = await getPayload(); // Decode the JWT payload
      if (payload && payload.data) {
        this.firstName = localStorage.getItem('name') || '';
      }
    }
    this.getCategories();
    await this.loadCartItems();
    // ✅ Subscribe to cart updates so the cart count updates dynamically
    this.cartService.cartUpdated$.subscribe((updatedCart) => {
      console.log('🛒 Cart updated:', updatedCart);
      this.cartItems = updatedCart;
    });
  }
  onProfileUpdated(newFirstName: string) {
    console.log('🔄 Navbar Updated First Name:', newFirstName);
    this.firstName = newFirstName;
  }
  // Add these methods to your NavBarComponent class

  // For touch devices - toggle categories on click
  // For touch devices - toggle categories on click
  // For touch devices - toggle categories on click
  toggleCategoriesOnMobile(event: Event) {
    // Always prevent default behavior first
    event.preventDefault();
    event.stopPropagation();

    // Check if we're on a touch device or small screen
    if ('ontouchstart' in window || window.innerWidth <= 768) {
      this.isCategoriesVisible = !this.isCategoriesVisible;

      // If showing categories, add a click handler to the document to close when clicking outside
      if (this.isCategoriesVisible) {
        setTimeout(() => {
          document.addEventListener('click', this.handleOutsideClick);
        }, 0);
      }
    } else {
      // For non-touch devices, navigate to products page
      // Use setTimeout to ensure the preventDefault takes effect first
      setTimeout(() => {
        this.router.navigate(['/products']);
      }, 10);
    }

    // Return false to further prevent default behavior
    return false;
  }

  // Close categories on mobile
  hideCategoriesOnMobile(event: Event) {
    event.preventDefault();
    event.stopPropagation();
    this.isCategoriesVisible = false;
    document.removeEventListener('click', this.handleOutsideClick);
  }

  // Handle clicks outside the category dropdown
  handleOutsideClick = (event: MouseEvent) => {
    const categorySection = document.querySelector('.Category_Section');
    const dropdown = document.querySelector('.Dropdown');

    if (
      categorySection &&
      dropdown &&
      !categorySection.contains(event.target as Node) &&
      !dropdown.contains(event.target as Node)
    ) {
      this.isCategoriesVisible = false;
      document.removeEventListener('click', this.handleOutsideClick);
    }
  };

  // Clean up event listeners when component is destroyed
  ngOnDestroy() {
    document.removeEventListener('click', this.handleOutsideClick);
  }
}
