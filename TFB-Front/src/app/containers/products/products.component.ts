import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { ActivatedRoute } from '@angular/router';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';

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
    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '300px',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((selectedQuantity) => {
      if (selectedQuantity) {
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
      const cartId = await this.cartService.getCartId(); // ✅ Get cart ID from service
      if (!cartId) {
        console.error('🚨 No active cart found for this user.');
        alert('❌ Could not find an active cart.');
        return;
      }

      let finalPrice = product.price;
      if (product.sale?.isOnSale) {
        const currentDate = new Date();
        if (
          new Date(product.sale.saleStartDate) <= currentDate &&
          new Date(product.sale.saleEndDate) >= currentDate
        ) {
          finalPrice = product.sale.salePrice;
        }
      }

      const cartItem = {
        cart_id: cartId,
        product_id: product._id,
        name: product.name,
        amount: quantity,
        full_price: finalPrice * quantity,
      };

      console.log('🛒 Adding to cart:', cartItem);

      await this.cartService.addItemToCart(cartItem);
      alert(`✅ ${quantity}x ${product.name} added to cart!`);
      this.cartService.refreshCart();
    } catch (error) {
      console.error('❌ Failed to add item to cart:', error);
      alert('❌ Failed to add item to cart.');
    }
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

  loadProducts() {
    let filteredProducts = [...this.allProducts];

    if (this.searchValue.trim() !== '') {
      filteredProducts = this.allProducts.filter((product) =>
        product.name.toLowerCase().includes(this.searchValue.toLowerCase())
      );
    } else {
      if (this.selectedCategory !== 'All') {
        filteredProducts = filteredProducts.filter(
          (product) => product.category?.name === this.selectedCategory
        );
      }

      if (this.selectedCustomerType !== 'All') {
        filteredProducts = filteredProducts.filter((product) => {
          const customerType = product.details?.costumer_type || 'New';
          return customerType === this.selectedCustomerType;
        });
      }

      if (this.selectedBrand !== 'All') {
        filteredProducts = filteredProducts.filter((product) => {
          const productBrand = product.brand?.toLowerCase().trim();
          return productBrand === this.selectedBrand.toLowerCase().trim();
        });
      }
    }

    filteredProducts.sort((a, b) => {
      let valueA, valueB;

      if (this.sortBy === 'name') {
        valueA = a.name.toLowerCase();
        valueB = b.name.toLowerCase();
      } else if (this.sortBy === 'price') {
        valueA = a.price;
        valueB = b.price;
      } else if (this.sortBy === 'stock') {
        if (a.quantity === 0 && b.quantity !== 0) return 1;
        if (b.quantity === 0 && a.quantity !== 0) return -1;
        if (a.quantity < 5 && b.quantity >= 5) return -1;
        if (b.quantity < 5 && a.quantity >= 5) return 1;
        valueA = a.quantity;
        valueB = b.quantity;
      }

      if (valueA < valueB) return this.order === 'asc' ? -1 : 1;
      if (valueA > valueB) return this.order === 'asc' ? 1 : -1;
      return 0;
    });

    this.totalPages = Math.ceil(filteredProducts.length / this.itemsPerPage);
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    this.products = filteredProducts.slice(
      startIndex,
      startIndex + this.itemsPerPage
    );
  }

  searchProducts() {
    this.currentPage = 1;
    this.loadProducts();
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
