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

  async fetchAllProducts() {
    this.productService.getProducts().subscribe((data: any) => {
      this.allProducts = data.products;
      this.extractFilters();
      this.loadProducts();
    });
  }

  // Load products and check if they are in the cart
  async loadProducts() {
    try {
      const cartItems = await this.cartService.getCartItems();
      console.log('🛒 Current Cart Items:', cartItems);

      // Log the cart items properly
      cartItems.forEach((item: any) => {
        console.log(
          '🛍 Cart Item - ID:',
          item.product_id?._id || item.product_id,
          'Name:',
          item.name
        );
      });

      this.products = this.allProducts.map((product) => {
        const isInCart = cartItems.some(
          (item: any) =>
            String(item.product_id?._id || item.product_id) ===
            String(product._id)
        );

        console.log(
          `📦 Product: ${product.name} (ID: ${product._id}), isInCart: ${isInCart}`
        );

        return {
          ...product,
          isInCart,
        };
      });

      console.log('✅ Updated Products with Cart Status:', this.products);
    } catch (error) {
      console.error('❌ Error loading products:', error);
    }
  }

  openQuantityDialog(product: any) {
    console.log(
      `📌 Opening Quantity Dialog for: ${product.name}, isInCart: ${product.isInCart}`
    );

    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '300px',
      data: { product },
    });

    dialogRef.afterClosed().subscribe((selectedQuantity) => {
      console.log(
        `📩 Selected Quantity: ${selectedQuantity} for ${product.name}`
      );
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
      const cartId = await this.cartService.getCartId();
      if (!cartId) {
        console.error('🚨 No active cart found for this user.');
        alert('❌ You need to login first.');
        return;
      }

      // Fetch current cart items
      const cartItems = await this.cartService.getCartItems();
      console.log('🔍 Cart Items Before Operation:', cartItems);

      // Find if the product is already in the cart
      const existingCartItem = cartItems.find(
        (item: any) =>
          String(item.product_id?._id || item.product_id) ===
          String(product._id)
      );

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

      console.log(
        `🛒 Processing ${quantity}x ${product.name} (ID: ${product._id})`
      );

      if (existingCartItem) {
        // If the product already exists in the cart, update its quantity
        const totalQuantity = quantity; // Set the quantity to the selected amount

        if (totalQuantity <= product.quantity) {
          existingCartItem.amount = totalQuantity;
          existingCartItem.full_price = finalPrice * totalQuantity;

          await this.cartService.editItemAmount(
            existingCartItem._id,
            existingCartItem.amount,
            existingCartItem.full_price
          );

          alert(
            `✅ Updated ${product.name} quantity to ${totalQuantity} in cart!`
          );
        } else {
          alert(
            `❌ You cannot add more than ${product.quantity} of ${product.name}.`
          );
        }
      } else {
        // If the product is not in the cart, add it
        if (quantity > product.quantity) {
          quantity = product.quantity;
          alert(`❌ Maximum ${product.quantity} of ${product.name} allowed.`);
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
      }

      // Refresh cart and update product statuses
      await this.cartService.refreshCart();
      this.loadProducts();
    } catch (error) {
      console.error('❌ Failed to process cart operation:', error);
      alert('❌ Failed to update cart.');
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
  debugButtonClick(product: any) {
    console.log(
      `🖱 Button Clicked: ${product.name} (ID: ${product._id}), isInCart: ${product.isInCart}`
    );
    this.openQuantityDialog(product);
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
