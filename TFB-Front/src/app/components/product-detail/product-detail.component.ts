import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CartService } from 'src/app/serverServices/cart/cart.service';
import { ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { QuantityDialogComponent } from 'src/app/components/PopUpComponents/quantity-dialog/quantity-dialog.component';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';
import { environment } from '../../../environments/environment'; // Import environment

@Component({
  selector: 'app-product-detail',
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css'],
})
export class ProductDetailComponent implements OnInit {
  product: any;
  cartItems: any[] = [];
  existingQuantity: number = 0;
  public token: any = '';
  public isAdmin: any;
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment
  selectedImage: string = ''; // Store the selected image URL
  selectedOption: string = ''; // Store selected option
  maxAvailableQuantity: number = 0; // Store max available quantity

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
      this.token = localStorage.getItem('token') || '';
      this.isAdmin = getIsAdmin();
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

        // ✅ If options exist & no option selected, set the first option as default
        if (this.product.details?.options?.length > 0 && !this.selectedOption) {
          this.selectedOption = this.product.details.options[0].option;
          console.log('🎯 Default Option Selected:', this.selectedOption);
        }

        this.checkIfProductInCart();
      },
      (error) => {
        console.error('❌ Error fetching product details:', error);
      }
    );
  }

  getMaxAvailableQuantity() {
    if (this.product.details?.options?.length > 0) {
      const selectedOptionDetails = this.product.details.options.find(
        (opt: any) => opt.option === this.selectedOption
      );

      if (selectedOptionDetails) {
        this.maxAvailableQuantity = selectedOptionDetails.quantity;
      } else {
        console.warn('⚠ Selected option not found in product details!');
        this.maxAvailableQuantity = 0; // Prevent issues if option not found
      }
    } else {
      this.maxAvailableQuantity = this.product.quantity;
    }
    console.log('🛒 Max Available Quantity:', this.maxAvailableQuantity);
  }

  // ✅ Check if product is in the cart
  checkIfProductInCart() {
    console.log('🛒 Checking if product is in the cart...');
    this.cartService.getCartItems().then((cartItems) => {
      this.cartItems = cartItems;
      console.log('🔍 Cart Items:', this.cartItems);

      const cartItem = cartItems.find((item) => {
        const productIdStr = String(this.product._id);
        const cartItemIdStr = String(item.product_id?._id || item?.product_id);
        return productIdStr === cartItemIdStr;
      });

      if (cartItem) {
        console.log(`🔄 Product ${this.product.name} found in cart`);
        this.existingQuantity = cartItem.amount;
        this.selectedOption = cartItem.option || '';
      } else {
        console.log(`🔄 Product ${this.product.name} is NOT in cart`);
        this.existingQuantity = 0;
        this.selectedOption = '';
      }

      this.getMaxAvailableQuantity(); // ✅ Update max quantity based on option
    });
  }
  isItemInCart(): boolean {
    return this.cartItems.some(
      (item) =>
        String(item.product_id?._id || item.product_id) ===
          String(this.product._id) &&
        (item.option || null) === (this.selectedOption || null)
    );
  }

  // Open the quantity dialog to add/edit the product in the cart
  openQuantityDialog(product: any) {
    console.log(
      `📌 Opening Quantity Dialog for: ${product.name}, existing quantity: ${this.existingQuantity}`
    );

    if (!this.token) {
      alert('❌ You need to login first.');
      return;
    }

    if (product.details?.options?.length && !this.selectedOption) {
      alert('❌ Please select an option before adding to cart.');
      return;
    }

    this.getMaxAvailableQuantity(); // Ensure latest quantity before opening

    const dialogRef = this.dialog.open(QuantityDialogComponent, {
      width: '300px',
      data: {
        product,
        existingQuantity: this.existingQuantity,
        selectedOption: this.selectedOption,
        maxAvailableQuantity: this.maxAvailableQuantity, // ✅ Pass max quantity
      },
    });

    dialogRef.afterClosed().subscribe((selectedData) => {
      if (selectedData) {
        console.log(
          `📩 Selected Quantity: ${selectedData.quantity}, Nic: ${selectedData.nic}, Ice: ${selectedData.ice}, Option: ${this.selectedOption} for ${product.name}`
        );

        this.addToCart(
          product,
          selectedData.quantity,
          selectedData.nic,
          selectedData.ice,
          selectedData.option // ✅ Pass selected option
        );
      }
    });
  }

  selectColor(color: string) {
    if (!this.product || !this.product.name) {
      console.error('🚨 Product name is missing!');
      return;
    }

    // ✅ Set the selected image based on color
    this.selectedImage = `${this.apiUrl}/assets/products/${this.product.name}_${color}.jpg`;
    console.log(`🎨 Switched to color image: ${this.selectedImage}`);
  }
  // ✅ Get all keys from the details object (ignoring empty values)
  getDetailKeys(): string[] {
    return Object.keys(this.product.details || {}).filter(
      (key) =>
        this.product.details[key] !== null && this.product.details[key] !== ''
    );
  }

  // ✅ Determine if a key represents a color field
  isColorField(key: string): boolean {
    return key.toLowerCase().includes('color');
  }

  // ✅ Set option and update UI when an option is clicked
  selectOption(option: string) {
    if (!this.product || !this.product.name) {
      console.error('🚨 Product name is missing!');
      return;
    }

    this.selectedOption = option; // ✅ Set selected option
    console.log(`🎨 Selected option: ${this.selectedOption}`);
    this.getMaxAvailableQuantity(); // ✅ Update max quantity

    // ✅ Ensure the selected image updates with the chosen option
    this.selectedImage = `${this.apiUrl}/assets/products/${this.product.name}_${option}.jpg`;
  }

  // ✅ Check if "options" contain color values
  isColorOptions(options: any[]): boolean {
    const colorKeywords = [
      'red',
      'blue',
      'black',
      'green',
      'yellow',
      'white',
      'purple',
      'gray',
      'orange',
      'pink',
    ];
    return options.every((opt) =>
      colorKeywords.includes(opt.option.toLowerCase())
    );
  }
  // ✅ Get background color for multi-word colors
  getBackgroundColor(option: string): string {
    const colors = option.split(' '); // Handle multiple colors
    return colors.length > 1
      ? `linear-gradient(to right, ${colors.join(', ')})`
      : option;
  }

  // ✅ Format keys to be more readable
  formatKeyName(key: string): string {
    return key
      .replace(/([A-Z])/g, ' $1') // Insert spaces before uppercase letters
      .replace(/^./, (str) => str.toUpperCase()); // Capitalize first letter
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
  // Add the product to the cart or edit its quantity if it's already in the cart
  async addToCart(
    product: any,
    quantity: number,
    nic?: number,
    ice?: number,
    selectedOption?: string // ✅ Now explicitly passing the picked option
  ) {
    console.log(
      `🛒 Attempting to add/edit product: ${product.name}, Quantity: ${quantity}`
    );

    if (!product || !product._id || quantity < 1) {
      console.error('🚨 Invalid product or quantity!', product);
      alert('❌ Invalid product or quantity!');
      return;
    }

    try {
      const cartId = await this.cartService.getCartId();
      if (!cartId) {
        console.error('🚨 No active cart found.');
        alert('❌ You need to login first.');
        return;
      }

      let finalPrice = product.sale?.isOnSale
        ? product.sale.salePrice
        : product.price;

      if (!this.cartItems || !Array.isArray(this.cartItems)) {
        console.error('🚨 cartItems is not an array:', this.cartItems);
        this.cartItems = [];
      }

      console.log('📋 Checking if item exists in cart...');

      // 🔍 Find an exact match in the cart (same product, same option)
      const cartItem = this.cartItems.find(
        (item) =>
          String(item.product_id._id) === String(product._id) &&
          (item.option || null) === (selectedOption || null) // ✅ Use the picked option
      );

      if (cartItem) {
        // ✅ If product exists with same option, override with new quantity
        console.log('✏ Found existing cart item:', cartItem);

        const updatedAmount = quantity; // ✅ Override instead of adding
        const updatedFullPrice = finalPrice * updatedAmount;

        console.log('🔄 Updating existing item in cart:', {
          amount: updatedAmount,
          nic,
          ice,
          option: selectedOption, // ✅ Use the picked option
        });

        if (!cartItem._id) {
          console.error('🚨 cartItem._id is undefined!', cartItem);
          alert('❌ Error updating item in cart.');
          return;
        }

        await this.cartService.editItemAmount(
          cartItem._id,
          updatedAmount, // ✅ Now setting, not adding
          updatedFullPrice,
          nic,
          ice,
          selectedOption // ✅ Ensure the selected option is passed
        );

        alert(`✅ Updated ${product.name} in cart!`);
      } else {
        // 🛒 Add a new item **only if the selected option is different**
        console.log(`🛒 Adding New Item to Cart: ${product.name}`);

        const newCartItem = {
          cart_id: cartId,
          product_id: product._id,
          name: product.name,
          amount: quantity,
          nic: nic ?? null,
          ice: ice ?? null,
          option: selectedOption || null, // ✅ Store the picked option
          full_price: finalPrice * quantity,
        };

        console.log('NEW ITEM:', newCartItem);

        await this.cartService.addItemToCart(newCartItem);
        alert(
          `✅ ${quantity}x ${product.name} (Nic: ${nic}, Ice: ${ice}, Option: ${this.selectedOption}) added to cart!`
        );
      }

      await this.cartService.refreshCart();
      this.checkIfProductInCart();
    } catch (error) {
      console.error('❌ Failed to add/edit item in cart:', error);
      alert('❌ Failed to update cart.');
    }
  }
}
