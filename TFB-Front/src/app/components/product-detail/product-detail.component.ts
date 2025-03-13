import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: any;
  cartItems: any[] = [];
  existingQuantity: number = 0;

  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private route: ActivatedRoute,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.route.params.subscribe((params) => {
      const productId = params['id'];
      this.fetchProductDetails(productId);
    });
  }
  isCurrentlyOnSale(sale: any): boolean {
    if (!sale?.isOnSale || !sale.saleStartDate || !sale.saleEndDate)
      return false;

    const now = new Date();
    const start = new Date(sale.saleStartDate);
    const end = new Date(sale.saleEndDate);

    return now >= start && now <= end;
  }

  // Fetch the details of the product from the database
  fetchProductDetails(productId: string) {
    console.log('📦 Fetching product details...');
    this.productService.getProductById(productId).subscribe(
      (data: any) => {
        console.log('📦 Product details fetched:', data);
        this.product = data;
        console.log('🔍 Fetching product', this.product);

        this.checkIfProductInCart();
      },
      (error) => {
        console.error('❌ Error fetching product details:', error);
      }
    );
  }

  // Check if the product is already in the cart
  checkIfProductInCart() {
    console.log('🛒 Checking if product is in the cart...');
    this.cartService.getCartItems().then((cartItems) => {
      this.cartItems = cartItems;
      console.log('🔍 Cart Items:', this.cartItems);

      const cartItem = cartItems.find((item) => {
        console.log('🔑 Product ID:', this.product._id); // Log the product ID
        console.log('🔑 Cart Item ID:', item.product_id); // Log the cart item ID

        // Make sure both product IDs are strings before comparing
        const productIdStr = String(this.product._id);

        // If cartItem.product_id is an object, compare the _id field
        const cartItemIdStr = String(item.product_id?._id || item?.product_id);

        console.log('🔑 Product ID (String):', productIdStr); // Debug log
        console.log('🔑 Cart Item ID (String):', cartItemIdStr); // Debug log

        return productIdStr === cartItemIdStr; // Compare both IDs as strings
      });

      if (cartItem) {
        console.log(`🔄 Product ${this.product.name} found in cart`);
        this.existingQuantity = cartItem.amount;
      } else {
        console.log(`🔄 Product ${this.product.name} is NOT in cart`);
        this.existingQuantity = 0;
      }
    });
  }

  // Open the quantity dialog to add/edit the product in the cart
  openQuantityDialog(product: any) {
    console.log(
      `📌 Opening Quantity Dialog for: ${product.name}, existing quantity: ${this.existingQuantity}`
    );

    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '300px',
      data: {
        product,
        existingQuantity: this.existingQuantity, // Pass the existing quantity if editing
      },
    });

    dialogRef.afterClosed().subscribe((selectedQuantity) => {
      console.log(
        `📩 Selected Quantity: ${selectedQuantity} for ${product.name}`
      );
      if (selectedQuantity !== undefined && selectedQuantity !== null) {
        this.addToCart(product, selectedQuantity);
      }
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
  // Add the product to the cart or edit its quantity if it's already in the cart
  async addToCart(product: any, quantity: number) {
    console.log(
      `🛒 Adding/Editing product: ${product.name}, quantity: ${quantity}`
    );

    if (!product || !quantity) {
      console.error('🚨 Product or quantity is undefined!');
      return;
    }

    try {
      // Fetch the current cart ID
      const cartId = await this.cartService.getCartId();
      if (!cartId) {
        console.error('🚨 No active cart found for this user.');
        alert('❌ You need to login first.');
        return;
      }

      // Determine the price: check if the product is on sale
      let finalPrice = product.sale?.isOnSale
        ? product.sale.salePrice
        : product.price;

      // Find the product in the cart using the correct ID
      const cartItem = this.cartItems.find(
        (item) => String(item.product_id._id) === String(product._id)
      );

      if (cartItem) {
        // If the product already exists in the cart, update the quantity
        console.log(
          `✏ Editing Cart Item for ${product.name} (ID: ${product._id})`
        );

        cartItem.amount = quantity;
        cartItem.full_price = finalPrice * quantity;

        await this.cartService.editItemAmount(
          cartItem._id,
          cartItem.amount,
          cartItem.full_price
        );
        alert(`✅ Updated ${product.name} quantity to ${quantity} in cart!`);
      } else {
        // If the product is not in the cart, add a new item
        console.log(`🛒 Adding New Item to Cart: ${product.name}`);

        const newCartItem = {
          cart_id: cartId,
          product_id: product._id,
          name: product.name,
          amount: quantity,
          full_price: finalPrice * quantity,
        };

        await this.cartService.addItemToCart(newCartItem);
        alert(`✅ ${quantity}x ${product.name} added to cart!`);
      }

      // Refresh the cart and check if the product is in the cart
      await this.cartService.refreshCart();
      this.checkIfProductInCart(); // Ensure that the quantity is updated
    } catch (error) {
      console.error('❌ Failed to add/edit item in cart:', error);
      alert('❌ Failed to update cart.');
    }
  }
}
