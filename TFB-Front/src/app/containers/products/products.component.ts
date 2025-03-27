import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';
import { environment } from '../../../environments/environment'; // Import environment

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  products: any[] = [];
  allProducts: any[] = [];
  categories: string[] = [];
  brands: string[] = [];
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 30;
  sortBy: string = 'name';
  order: string = 'asc';
  searchValue: string = '';
  selectedCategory: string = 'All';
  selectedBrand: string = 'All';
  searchResults: any[] = []; // ✅ Store search results separately
  public isAdmin: any;
  topProducts: any = []; // ✅ Store all top product IDs
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private router: Router,
    public dialog: MatDialog
  ) {}

  private routeSubscription: any;

  ngOnInit() {
    // Initialize products and categories first
    this.fetchAllProducts().then(() => {
      // Clean up any existing subscription
      if (this.routeSubscription) {
        this.routeSubscription.unsubscribe();
      }

      // After products are loaded, subscribe to route parameter changes
      this.routeSubscription = this.route.queryParams.subscribe((params) => {
        console.log('🟡 ROUTE PARAMS:', params);

        // Process the category parameter
        const categoryParam = params['category']
          ? params['category'].trim()
          : 'All';
        console.log('🔵 Processing category parameter:', categoryParam);

        if (categoryParam !== 'All') {
          // Try to find an exact match first
          const exactMatch = this.categories.find(
            (cat) => cat === categoryParam
          );
          if (exactMatch) {
            this.selectedCategory = exactMatch;
            console.log(
              '🔵 Found exact category match:',
              this.selectedCategory
            );
          } else {
            // Try to find a partial match
            const partialMatch = this.findMatchingCategory(categoryParam);
            if (partialMatch) {
              this.selectedCategory = partialMatch;
              console.log(
                '🔵 Found partial category match:',
                this.selectedCategory
              );
            } else {
              this.selectedCategory = 'All';
              console.log('🔵 No matching category found, using All');
            }
          }
        } else {
          this.selectedCategory = 'All';
        }

        console.log('🔵 Final selected category:', this.selectedCategory);

        // Now apply the filtering with the correct category
        this.loadProducts();
      });
    });

    this.isAdmin = getIsAdmin();
    this.getTopProducts();
  }

  // Clean up subscription when component is destroyed
  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.selectedCategory = 'All';
  }

  // Helper method to find a matching category
  findMatchingCategory(searchCategory: string): string | null {
    if (!searchCategory || !this.categories || this.categories.length === 0) {
      return null;
    }

    const searchLower = searchCategory.toLowerCase();
    console.log('🔍 Finding match for:', searchLower);
    console.log('🔍 Available categories:', this.categories);

    // First try exact match
    const exactMatch = this.categories.find(
      (category) => category.toLowerCase() === searchLower
    );
    if (exactMatch) {
      console.log('🔍 Found exact match:', exactMatch);
      return exactMatch;
    }

    // Then try partial match
    const partialMatch = this.categories.find(
      (category) =>
        category.toLowerCase().includes(searchLower) ||
        searchLower.includes(category.toLowerCase())
    );

    if (partialMatch) {
      console.log('🔍 Found partial match:', partialMatch);
    } else {
      console.log('🔍 No match found');
    }

    return partialMatch || null;
  }

  fetchAllProducts(): Promise<void> {
    return new Promise((resolve) => {
      this.productService.getProducts().subscribe(
        (data: any) => {
          console.log('📦 All Products fetched:', data.products);
          this.allProducts = data.products;

          this.extractFilters();

          resolve();
        },
        (error) => {
          console.error('Error fetching products:', error);
          resolve(); // Resolve even on error to continue the flow
        }
      );
    });
  }

  async openQuantityDialog(product: any) {
    console.log(`📌 Opening Quantity Dialog for: ${product.name}`);

    // Get existing cart item details
    const cartItems = await this.cartService.getCartItems();
    const existingCartItem = cartItems.find(
      (item) =>
        String(item.product_id?._id || item.product_id) === String(product._id)
    );

    // Pass correct existing quantity, nic, ice, and option
    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '300px',
      data: {
        product,
        existingQuantity: existingCartItem?.amount || 0,
        nic: existingCartItem?.nic || 0,
        ice: existingCartItem?.ice || 0,
        selectedOption:
          existingCartItem?.option ||
          product.details?.options?.[0]?.option ||
          '',
      },
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        console.log(`📩 Selected Data from Dialog:`, result);
        this.addToCart(
          product,
          result.quantity,
          result.nic,
          result.ice,
          result.option
        );
      }
    });
  }

  async addToCart(
    product: any,
    quantity: number,
    nic: number,
    ice: number,
    option: string
  ) {
    console.log(`🛒 Adding/Editing Cart Item: ${product.name}`);

    if (!product || quantity < 1) {
      console.error('🚨 Invalid product or quantity!');
      return;
    }

    try {
      const cartId = await this.cartService.getCartId();
      if (!cartId) {
        alert('❌ You need to login first.');
        return;
      }

      const cartItems = await this.cartService.getCartItems();
      const existingCartItem = cartItems.find((item) => {
        const isSameProduct =
          String(item.product_id?._id || item.product_id) ===
          String(product._id);
        const isSameOption = (item.option || '') === (option || '');

        // ✅ Category ID matching
        const categoryId = product.category?._id || product.category;
        const SALT_ID = '67759289eca0466ca85bfac3';
        const TFB120_ID = '67759289eca0466ca85bfaba';

        if (categoryId === SALT_ID) {
          return isSameProduct && isSameOption && item.ice === ice;
        }

        if (categoryId === TFB120_ID) {
          return (
            isSameProduct &&
            isSameOption &&
            item.nic === nic &&
            item.ice === ice
          );
        }

        // Default match for other categories
        return isSameProduct && isSameOption;
      });

      let finalPrice = product.sale?.isOnSale
        ? product.sale.salePrice
        : product.price;

      if (existingCartItem) {
        console.log('✏ Updating existing item in cart');
        await this.cartService.editItemAmount(
          existingCartItem._id,
          quantity,
          finalPrice * quantity,
          nic,
          ice,
          option
        );
      } else {
        console.log('🛒 Adding new item to cart');
        await this.cartService.addItemToCart({
          cart_id: cartId,
          product_id: product._id,
          name: product.name,
          amount: quantity,
          nic,
          ice,
          option,
          full_price: finalPrice * quantity,
        });
      }

      await this.cartService.refreshCart();
      this.loadProducts();
    } catch (error) {
      console.error('❌ Failed to update cart:', error);
      alert('❌ Error updating cart.');
    }
  }
  isCurrentlyOnSale(sale: any): boolean {
    if (!sale?.isOnSale || !sale.saleStartDate || !sale.saleEndDate)
      return false;

    const now = new Date();
    const start = new Date(sale.saleStartDate);
    const end = new Date(sale.saleEndDate);

    return now >= start && now <= end;
  }

  extractFilters() {
    // Extract unique categories - handle categories as objects
    const uniqueCategories = [
      ...new Set(
        this.allProducts
          .filter((p) => p.category && p.category.name) // Filter out null or invalid categories
          .map((p) => p.category.name)
      ),
    ];

    console.log('🔍 Unique category names found:', uniqueCategories);

    this.categories = ['All', ...uniqueCategories];
    console.log('🔍 Updated categories dropdown with:', this.categories);

    this.brands = [
      'All',
      ...new Set(
        this.allProducts.map((p) => p.brand?.toLowerCase().trim() || 'Unknown')
      ),
    ];
  }

  async loadProducts() {
    try {
      const cartItems = await this.cartService.getCartItems();
      console.log('🛒 Current Cart Items:', cartItems);

      let filteredProducts =
        this.searchResults.length > 0
          ? [...this.searchResults]
          : [...this.allProducts];

      console.log('🔍 Selected Category for filtering:', this.selectedCategory);

      // Log all available categories from products
      const availableCategories = filteredProducts.map(
        (p) => p.category?.name || 'Unknown'
      );
      console.log('🔍 Available categories in products:', [
        ...new Set(availableCategories),
      ]);

      // Apply filters only when not searching
      if (this.searchValue.trim() === '') {
        if (this.selectedCategory !== 'All') {
          console.log('🔍 Filtering by category:', this.selectedCategory);

          // Filter by category name - comparing with category.name
          filteredProducts = filteredProducts.filter((product) => {
            // Get the category name from the category object
            const categoryName = product.category?.name || '';
            const matches = categoryName === this.selectedCategory;

            console.log(
              `Product: ${product.name}, Category: "${categoryName}", Selected: "${this.selectedCategory}", Matches: ${matches}`
            );

            return matches;
          });
        }

        if (this.selectedBrand !== 'All') {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.brand?.toLowerCase() === this.selectedBrand.toLowerCase()
          );
        }
      }

      console.log(
        '🔍 After filtering, product count:',
        filteredProducts.length
      );

      // Apply sorting
      console.log(`🔄 Sorting by: ${this.sortBy} (${this.order})`);
      filteredProducts.sort((a, b) => {
        if (this.sortBy === 'name') {
          return this.order === 'asc'
            ? (a.name || '').localeCompare(b.name || '')
            : (b.name || '').localeCompare(a.name || '');
        } else if (this.sortBy === 'price') {
          const aPrice = a.sale?.isOnSale
            ? a.sale.salePrice || a.price
            : a.price;
          const bPrice = b.sale?.isOnSale
            ? b.sale.salePrice || b.price
            : b.price;
          return this.order === 'asc' ? aPrice - bPrice : bPrice - aPrice;
        } else if (this.sortBy === 'stock') {
          return this.order === 'asc'
            ? (a.quantity || 0) - (b.quantity || 0)
            : (b.quantity || 0) - (a.quantity || 0);
        }
        return 0;
      });

      console.log(
        '🔍 After sorting, first few products:',
        filteredProducts.slice(0, 3).map((p) => p.name)
      );

      // Rest of your code...
      // Apply pagination, etc.

      // Update the UI with the filtered and sorted products
      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      this.products = filteredProducts
        .slice(startIndex, startIndex + this.itemsPerPage)
        .map((product) => {
          const cartItem = cartItems.find(
            (item) =>
              String(item.product_id?._id || item.product_id) ===
              String(product._id)
          );

          return {
            ...product,
            isInCart: !!cartItem,
            cartQuantity: cartItem ? cartItem.amount : 0,
          };
        });

      console.log('✅ Final products to display:', this.products.length);

      // Calculate total pages
      this.totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
    } catch (error) {
      console.error('❌ Error loading products:', error);
    }
  }

  addToTopProducts(productId: string) {
    console.log('ADDDD TO TO1P');

    this.productService.getTopProducts().subscribe({
      next: (topProductsData: any) => {
        console.log('ADDDD TO3 TOP:', topProductsData);
        const topProductIds = (topProductsData || []).map((p: any) => p._id);
        console.log('Mapped IDs:', topProductIds);

        if (topProductIds.includes(productId)) {
          alert('⚠️ This product is already in Top Products!');
          return;
        }

        console.log('ADDDD TO TO2P');
        this.productService.addTopProduct(productId).subscribe({
          next: (response) => {
            console.log('Top product added:', response);
          },
          error: (error) => {
            console.error('Error adding top product:', error);
          },
        });
      },
      error: (error) => {
        console.error('❌ Error fetching top products:', error);
      },
      complete: () => {
        console.log('✅ Completed fetching top products.');
      },
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

  getTopProducts() {
    return this.productService.getTopProducts();
  }
  checkProductIfInTop() {}

  searchProducts() {
    if (this.searchValue.trim()) {
      console.log(`🔍 Searching for: ${this.searchValue}`);

      this.productService
        .getProducts(1, 1000, this.sortBy, this.order, 'name', this.searchValue)
        .subscribe((data: any) => {
          if (data.products.length === 0) {
            console.warn(
              '❌ No products found for search term:',
              this.searchValue
            );
            alert('❌ No products match your search.');
            return;
          }

          this.searchResults = data.products; // ✅ Store search results separately
          this.currentPage = 1; // ✅ Reset to first page
          this.totalPages = Math.ceil(
            this.searchResults.length / this.itemsPerPage
          );
          this.loadProducts();
        });
    } else {
      console.log('🔄 Clearing search, restoring all products');
      this.searchResults = []; // ✅ Clear search results when search is cleared
      this.fetchAllProducts(); // ✅ Reload full product list
    }
  }
  changeSorting() {
    console.log(`🔄 Changing sorting to: ${this.sortBy}`);

    // Parse the sortBy value to determine the field and order
    if (this.sortBy === 'price_desc') {
      this.sortBy = 'price';
      this.order = 'desc';
    } else if (this.sortBy === 'stock_desc') {
      this.sortBy = 'stock';
      this.order = 'desc';
    } else if (this.sortBy === 'price' || this.sortBy === 'stock') {
      this.order = 'asc';
    } else {
      // Default for 'name' and any other values
      this.sortBy = 'name';
      this.order = 'asc';
    }

    console.log(`🔄 Parsed sorting: ${this.sortBy} (${this.order})`);

    this.currentPage = 1; // Reset to first page when sorting changes
    this.loadProducts();
  }

  filterByCategory() {
    this.currentPage = 1;

    // Update the URL to reflect the selected category
    const queryParams =
      this.selectedCategory === 'All'
        ? {}
        : { category: this.selectedCategory };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge', // Keep other query params
    });

    // Also apply the filtering directly
    this.loadProducts();
  }

  filterByBrand() {
    this.currentPage = 1;
    this.loadProducts();
  }

  filterByCustomerType() {
    this.currentPage = 1;
    this.loadProducts();
  }

  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }
}
