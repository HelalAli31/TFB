import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';
import { environment } from '../../../environments/environment';
import { LanguageService } from 'src/app/serverServices/language.service';

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
  itemsPerPage: number = 24;
  sortBy: string = 'name';
  order: string = 'asc';
  searchValue: string = '';
  selectedCategory: string = 'All';
  selectedBrand: string = 'All';
  searchResults: any[] = [];
  public isAdmin: any;
  topProducts: any = [];
  apiUrl = environment.apiUrl;
  loading: boolean = false;

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private cartService: CartService,
    private router: Router,
    public dialog: MatDialog,
    public languageService: LanguageService
  ) {}

  private routeSubscription: any;

  async ngOnInit() {
    this.fetchAllProducts().then(() => {
      if (this.routeSubscription) {
        this.routeSubscription.unsubscribe();
      }

      this.routeSubscription = this.route.queryParams.subscribe((params) => {
        const categoryParam = params['category']
          ? params['category'].trim()
          : 'All';

        if (categoryParam !== 'All') {
          const exactMatch = this.categories.find(
            (cat) => cat === categoryParam
          );
          if (exactMatch) {
            this.selectedCategory = exactMatch;
          } else {
            const partialMatch = this.findMatchingCategory(categoryParam);
            if (partialMatch) {
              this.selectedCategory = partialMatch;
            } else {
              this.selectedCategory = 'All';
            }
          }
        } else {
          this.selectedCategory = 'All';
        }

        this.loadProducts();
      });
    });

    this.isAdmin = getIsAdmin();
    this.getTopProducts();
  }

  ngOnDestroy() {
    if (this.routeSubscription) {
      this.routeSubscription.unsubscribe();
    }
    this.selectedCategory = 'All';
  }

  findMatchingCategory(searchCategory: string): string | null {
    if (!searchCategory || !this.categories || this.categories.length === 0) {
      return null;
    }

    const searchLower = searchCategory.toLowerCase();
    const exactMatch = this.categories.find(
      (category) => category.toLowerCase() === searchLower
    );
    if (exactMatch) {
      return exactMatch;
    }

    const partialMatch = this.categories.find(
      (category) =>
        category.toLowerCase().includes(searchLower) ||
        searchLower.includes(category.toLowerCase())
    );

    return partialMatch || null;
  }
  fetchAllProducts(): Promise<void> {
    this.loading = true; // Show spinner
    return new Promise((resolve) => {
      this.productService
        .getProducts(1, 1000, this.sortBy, this.order, '', '', true)
        .subscribe(
          (data: any) => {
            this.allProducts = data.products;
            console.log('ALL PRODUCTS:', this.allProducts);
            this.extractFilters();
            this.loading = false; // Hide spinner
            resolve();
          },
          (error) => {
            console.error('Error fetching products:', error);
            this.loading = false; // Hide spinner even if error
            resolve();
          }
        );
    });
  }

  async openQuantityDialog(product: any) {
    const cartItems = await this.cartService.getCartItems();
    const existingCartItem = cartItems.find(
      (item) =>
        String(item.product_id?._id || item.product_id) === String(product._id)
    );

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
    if (!product || quantity < 1) {
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

        return isSameProduct && isSameOption;
      });

      let finalPrice = product.sale?.isOnSale
        ? product.sale.salePrice
        : product.price;

      if (existingCartItem) {
        await this.cartService.editItemAmount(
          existingCartItem._id,
          quantity,
          finalPrice * quantity,
          nic,
          ice,
          option
        );
      } else {
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
    const uniqueCategories = [
      ...new Set(
        this.allProducts
          .filter((p) => p.category && p.category.name)
          .map((p) => p.category.name)
      ),
    ];

    this.categories = ['All', ...uniqueCategories];

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
      let filteredProducts =
        this.searchValue.trim() === ''
          ? [...this.allProducts]
          : [...this.searchResults];

      console.log('Initial filtered products:', filteredProducts);

      // Apply category filter
      if (this.selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter((product) => {
          if (!product.category) return false;
          const categoryName = (product.category.name || '')
            .trim()
            .toLowerCase();
          const selectedCategoryName = this.selectedCategory
            .trim()
            .toLowerCase();
          return categoryName === selectedCategoryName;
        });
      }

      console.log('Filtered products after category filter:', filteredProducts);

      // Apply brand filter
      if (this.selectedBrand !== 'All') {
        filteredProducts = filteredProducts.filter(
          (product) =>
            product.brand?.toLowerCase() === this.selectedBrand.toLowerCase()
        );
      }

      console.log('Filtered products after brand filter:', filteredProducts);

      // Sort products
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

      // Pagination logic
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

      this.totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
      console.log('Filtered Products before filtering:', filteredProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  }

  addToTopProducts(productId: string) {
    this.productService.getTopProducts().subscribe({
      next: (topProductsData: any) => {
        const topProductIds = (topProductsData || []).map((p: any) => p._id);

        if (topProductIds.includes(productId)) {
          alert('⚠️ This product is already in Top Products!');
          return;
        }

        this.productService.addTopProduct(productId).subscribe();
      },
      error: (error) => {},
    });
  }

  getProductImage(product: any): string {
    if (!product || !product.name) {
      return `../../../assets/products/default.jpg`;
    }

    if (product.details?.options && product.details.options.length > 0) {
      const option = product.details.options[0]?.option;
      if (option) {
        return `${this.apiUrl}/assets/products/${product.name}_${option}.jpg`;
      }
    }

    return `${this.apiUrl}/assets/products/${product.name}.jpg`;
  }

  onImageError(event: any, product: any) {
    if (event.target.src.includes('default.jpg')) {
      return;
    }

    if (event.target.src.includes('_')) {
      const baseImage = `${this.apiUrl}/assets/products/${product.name}.jpg`;
      event.target.setAttribute('data-tried-fallback', 'true');
      event.target.src = baseImage;
      return;
    }

    event.target.src = `../../../assets/products/default.jpg`;
  }

  getTopProducts() {
    return this.productService.getTopProducts();
  }

  searchProducts() {
    if (this.searchValue.trim()) {
      this.productService
        .getProducts(1, 1000, this.sortBy, this.order, 'name', this.searchValue)
        .subscribe((data: any) => {
          this.searchResults = data.products;
          this.currentPage = 1;
          this.totalPages = Math.ceil(
            this.searchResults.length / this.itemsPerPage
          );
          this.loadProducts();
        });
    } else {
      this.searchResults = [];
      this.fetchAllProducts();
    }
  }

  changeSorting() {
    if (this.sortBy === 'price_desc') {
      this.sortBy = 'price';
      this.order = 'desc';
    } else if (this.sortBy === 'stock_desc') {
      this.sortBy = 'stock';
      this.order = 'desc';
    } else if (this.sortBy === 'price' || this.sortBy === 'stock') {
      this.order = 'asc';
    } else {
      this.sortBy = 'name';
      this.order = 'asc';
    }

    this.currentPage = 1;
    this.loadProducts();
  }

  filterByCategory() {
    this.currentPage = 1;

    const queryParams =
      this.selectedCategory === 'All'
        ? {}
        : { category: this.selectedCategory };
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge',
    });

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

      setTimeout(() => {
        console.log(
          '📄 Products on Page',
          this.currentPage,
          ':',
          this.products
        );
      }, 0);
    }
  }
}
