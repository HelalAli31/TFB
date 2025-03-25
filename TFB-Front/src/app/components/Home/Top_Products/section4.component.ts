import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';
import { PopUpDeleteItemComponent } from '../../PopUpComponents/pop-up-delete-item/pop-up-delete-item.component';
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-section4',
  templateUrl: './section4.component.html',
  styleUrls: ['./section4.component.css'],
})
export class Section4Component implements OnInit {
  public topProducts: any[] = [];
  public groupedProducts: { [category: string]: any[] } = {}; // Grouped top products by category
  public cartItems: any[] = []; // Store cart items to check if a product is in the cart
  public isAdmin: any;
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    public dialog: MatDialog
  ) {}
  async getTopProducts() {
    this.productService.getTopProducts().subscribe(
      async (result: any) => {
        if (!result || !Array.isArray(result)) {
          console.error('❌ Top Products data is not an array:', result);
          this.topProducts = [];
          return;
        }

        this.topProducts = result;
        console.log(
          '✅ Top Products:',
          JSON.stringify(this.topProducts, null, 2)
        );

        // 🔹 Log price to ensure sale price is received correctly
        this.topProducts.forEach((product) => {
          console.log(
            `📦 Product: ${product.name}, Price: ${product.price}, Original: ${product.originalPrice}, On Sale: ${product.sale?.isOnSale}`
          );
        });

        // Fetch cart items to update `isInCart`
        await this.loadCartItems();

        // ✅ Group top products by category
        this.groupedProducts = this.topProducts.reduce((acc, product) => {
          let categoryName = product.category || 'Uncategorized';

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

        console.log('✅ Grouped Top Products:', this.groupedProducts);
      },
      (error: any) => {
        console.error('❌ Error fetching top products:', error);
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

    this.cartService.getCartItems().then((cartItems) => {
      const existingCartItem = cartItems.find(
        (item: any) =>
          String(item.product_id?._id || item.product_id) ===
          String(product._id)
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
      console.log('🔍 Cart Items Before Adding:', cartItems);

      const existingCartItem = cartItems.find(
        (item: any) =>
          String(item.product_id?._id || item.product_id) ===
            String(product._id) && (item.option || '') === (option || '')
      );

      let finalPrice = product.sale?.isOnSale
        ? product.sale.salePrice
        : product.price;

      if (existingCartItem) {
        console.log('✏ Updating existing item in cart');

        if (quantity <= product.quantity) {
          await this.cartService.editItemAmount(
            existingCartItem._id,
            quantity,
            finalPrice * quantity,
            nic,
            ice,
            option
          );
          alert(`✅ Updated ${product.name} in cart!`);
        } else {
          alert(
            `❌ You cannot add more than ${product.quantity} of ${product.name}.`
          );
        }
      } else {
        console.log('🛒 Adding new item to cart');

        if (quantity > product.quantity) {
          quantity = product.quantity;
          alert(`❌ Maximum ${product.quantity} of ${product.name} allowed.`);
        }

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

        alert(`✅ Added ${quantity}x ${product.name} to cart!`);
      }

      await this.cartService.refreshCart();
      await this.loadCartItems();
      await this.getTopProducts();
    } catch (error) {
      console.error('❌ Failed to process cart operation:', error);
      alert('❌ Failed to update cart.');
    }
  }

  openDeleteDialog(productId: any, productName: any) {
    const dialogRef = this.dialog.open(PopUpDeleteItemComponent, {
      data: {
        title: 'Confirm Deletion',
        productName,
      },
      width: '350px',
    });

    dialogRef.afterClosed().subscribe(async (result: any) => {
      console.log('Dialog Result:', result);
      if (result === true) {
        this.productService.deleteTopProduct(productId).subscribe(
          (response) => {
            console.log('Top product deleted:', response);
            this.getTopProducts(); // Refresh the list after adding
          },
          (error) => {
            console.error('Error deleting top product:', error);
          }
        );
      }
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

  ngOnInit(): void {
    this.getTopProducts();
    this.isAdmin = getIsAdmin();
  }
}
