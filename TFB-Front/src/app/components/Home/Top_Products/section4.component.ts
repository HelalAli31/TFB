import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';

@Component({
  selector: 'app-section4',
  templateUrl: './section4.component.html',
  styleUrls: ['./section4.component.css'],
})
export class Section4Component implements OnInit {
  public products: any[] = [];
  public groupedProducts: { [category: string]: any[] } = {}; // Grouped products by category
  public cartItems: any[] = []; // Store cart items to check if a product is in the cart

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public dialog: MatDialog
  ) {}

  async get_products() {
    this.productService.getProducts().subscribe(
      async (result: any) => {
        if (!result || !Array.isArray(result.products)) {
          console.error('❌ Products data is not an array:', result);
          this.products = [];
          return;
        }

        this.products = result.products;
        console.log('✅ Products:', JSON.stringify(this.products, null, 2));

        // Fetch cart items to update isInCart flag
        await this.loadCartItems();

        // ✅ Group products by category
        this.groupedProducts = this.products.reduce((acc, product) => {
          let categoryName = product.category?.name || 'Uncategorized';

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }

          acc[categoryName].push({
            ...product,
            isInCart: this.cartItems.some(
              (item) =>
                String(item.product_id?._id || item.product_id) ===
                String(product._id)
            ),
          });

          return acc;
        }, {});

        console.log('✅ Grouped Products:', this.groupedProducts);
      },
      (error: any) => {
        console.error('❌ Error fetching products:', error);
      }
    );
  }

  async loadCartItems() {
    try {
      this.cartItems = await this.cartService.getCartItems();
      console.log('🛒 Loaded Cart Items:', this.cartItems);
    } catch (error) {
      console.error('❌ Failed to load cart items:', error);
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

      const cartItems = await this.cartService.getCartItems();
      console.log('🔍 Cart Items Before Adding:', cartItems);

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
        const totalQuantity = quantity; // Update quantity

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

      await this.cartService.refreshCart();
      await this.loadCartItems();
      await this.get_products();
    } catch (error) {
      console.error('❌ Failed to process cart operation:', error);
      alert('❌ Failed to update cart.');
    }
  }

  ngOnInit(): void {
    this.get_products();
  }
}
