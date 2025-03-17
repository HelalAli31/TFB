import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { ActivatedRoute } from '@angular/router';
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
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory = params['category'] || 'All';
      this.fetchAllProducts();
      this.isAdmin = getIsAdmin();
      this.getTopProducts();
    });
  }

  fetchAllProducts() {
    this.productService.getProducts().subscribe((data: any) => {
      this.allProducts = data.products;
      this.extractFilters();
      this.loadProducts();
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
      const existingCartItem = cartItems.find(
        (item) =>
          String(item.product_id?._id || item.product_id) ===
            String(product._id) && (item.option || '') === (option || '')
      );

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
    this.categories = [
      'All',
      ...new Set(this.allProducts.map((p) => p.category?.name || 'Unknown')),
    ];
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
          : [...this.allProducts]; // Use searchResults if they exist

      // Apply filters only when not searching
      if (this.searchValue.trim() === '') {
        if (this.selectedCategory !== 'All') {
          filteredProducts = filteredProducts.filter(
            (product) => product.category?.name === this.selectedCategory
          );
        }

        if (this.selectedBrand !== 'All') {
          filteredProducts = filteredProducts.filter(
            (product) =>
              product.brand?.toLowerCase() === this.selectedBrand.toLowerCase()
          );
        }
      }

      // Apply sorting
      filteredProducts.sort((a, b) => {
        if (this.sortBy === 'name') {
          return this.order === 'asc'
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name);
        } else if (this.sortBy === 'price') {
          return this.order === 'asc' ? a.price - b.price : b.price - a.price;
        } else if (this.sortBy === 'stock') {
          return this.order === 'asc'
            ? a.quantity - b.quantity
            : b.quantity - a.quantity;
        }
        return 0;
      });

      const startIndex = (this.currentPage - 1) * this.itemsPerPage;
      this.products = filteredProducts
        .slice(startIndex, startIndex + this.itemsPerPage)
        .map((product) => {
          const cartItem = cartItems.find(
            (item) =>
              String(item.product_id?._id || item.product_id) ===
              String(product._id)
          );

          console.log(
            `📦 Product: ${product.name} (ID: ${product._id}), In Cart: ${
              cartItem ? '✅ YES' : '❌ NO'
            }, Cart Quantity: ${cartItem ? cartItem.amount : 0}`
          );

          return {
            ...product,
            isInCart: !!cartItem, // ✅ True if product exists in cart
            cartQuantity: cartItem ? cartItem.amount : 0, // ✅ Store existing cart quantity
          };
        });

      console.log(
        '✅ Products loaded with updated cart status:',
        this.products
      );
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
    this.loadProducts();
  }

  filterByCategory() {
    this.currentPage = 1;
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
