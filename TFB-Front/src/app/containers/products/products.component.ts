import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';

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
  customerTypes: string[] = ['New', 'Normal', 'High Level'];
  currentPage: number = 1;
  totalPages: number = 1;
  itemsPerPage: number = 30;
  sortBy: string = 'name';
  order: string = 'asc';
  searchValue: string = '';
  selectedCategory: string = 'All';
  selectedBrand: string = 'All';
  selectedCustomerType: string = 'All';
  searchResults: any[] = []; // ✅ Store search results separately
  public isAdmin: any;
  topProducts: any = []; // ✅ Store all top product IDs

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      this.selectedCategory = params['category'] || 'All';
      this.selectedCustomerType = params['customerType'] || 'All';
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
  openQuantityDialog(product: any) {
    console.log(
      `📌 Opening Quantity Dialog for: ${product.name}, isInCart: ${product.isInCart}`
    );

    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '300px',
      data: {
        product,
        existingQuantity: product.cartQuantity || 0, // ✅ Ensure correct quantity is passed
      },
    });

    dialogRef.afterClosed().subscribe((selectedQuantity) => {
      if (selectedQuantity !== undefined && selectedQuantity !== null) {
        console.log(
          `📩 Selected Quantity: ${selectedQuantity} for ${product.name}`
        );
        this.addToCart(product, selectedQuantity);
      }
    });
  }

  async addToCart(product: any, quantity: number) {
    if (!product || !quantity) {
      console.error('🚨 Product or quantity is undefined!');
      return;
    }

    try {
      const cartId = await this.cartService.getCartId();
      if (!cartId) {
        console.error('🚨 No active cart found for this user.');
        alert('❌ You need to login first.');
        return;
      }

      const cartItems = await this.cartService.getCartItems();
      const existingCartItem = cartItems.find(
        (item) =>
          String(item.product_id?._id || item.product_id) ===
          String(product._id)
      );

      let finalPrice =
        product.sale?.isOnSale &&
        new Date(product.sale.saleStartDate) <= new Date() &&
        new Date(product.sale.saleEndDate) >= new Date()
          ? product.sale.salePrice
          : product.price;

      if (existingCartItem) {
        // ✅ If the item is already in the cart, update its quantity
        console.log(
          `✏ Editing Cart Item for ${product.name} (ID: ${product._id})`
        );

        existingCartItem.amount = quantity;
        existingCartItem.full_price = finalPrice * quantity;

        await this.cartService.editItemAmount(
          existingCartItem._id,
          existingCartItem.amount,
          existingCartItem.full_price
        );

        alert(`✅ Updated ${product.name} quantity to ${quantity} in cart!`);
      } else {
        // ✅ If the item is NOT in the cart, add it
        console.log(`🛒 Adding New Item to Cart: ${product.name}`);

        const cartItem = {
          cart_id: cartId,
          product_id: product._id,
          name: product.name,
          amount: quantity,
          full_price: finalPrice * quantity,
        };

        await this.cartService.addItemToCart(cartItem);
        alert(`✅ ${quantity}x ${product.name} added to cart!`);
      }

      await this.cartService.refreshCart();
      this.loadProducts(); // ✅ Refresh products after update
    } catch (error) {
      console.error('❌ Failed to update cart:', error);
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

        if (this.selectedCustomerType !== 'All') {
          filteredProducts = filteredProducts.filter((product) => {
            if (this.selectedCustomerType === 'New')
              return product.newCustomerDiscount;
            if (this.selectedCustomerType === 'High Level')
              return product.highLevelExclusive;
            return true;
          });
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
            alert(`${response.message}`);
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
