import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { EditProductDialogComponent } from '../../PopUpComponents/admin/edit-product-dialog/edit-product-dialog.component';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-admin-product-management',
  templateUrl: './admin-product-management.component.html',
  styleUrls: ['./admin-product-management.component.css'],
})
export class AdminProductManagementComponent implements OnInit {
  products: any[] = [];
  searchTerm: string = '';
  editingProduct: any = null;
  deletingProductId: string | null = null;
  public categories: any = [];
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment
  private productImageCache = new Map<string, string>();

  constructor(
    private productService: ProductService,
    private categoryService: CategoryService,
    public dialog: MatDialog
  ) {}

  ngOnInit() {
    this.fetchCategories();
    this.fetchProducts();
  }

  // ✅ Fetch Categories & Map IDs to Names
  async fetchCategories() {
    await this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categories = data; // ✅ Store as an array, NOT an object
        console.log(this.categories);
      },
      (error) => console.error('❌ Error fetching categories:', error)
    );
  }
  // ✅ Fetch Products
  async fetchProducts() {
    await this.productService.getProducts().subscribe(
      (data: any) => {
        console.log('🚀 Products Fetched:', data); // 🔍 Debugging
        this.products = data.products || [];
      },
      (error: any) => console.error('❌ Error fetching products:', error)
    );
  }
  getCategoryName(category: any): string {
    if (!category) return 'Unknown Category';

    // If `category` is already a string (ID), find the name
    if (typeof category === 'string') {
      const foundCategory = this.categories.find(
        (cat: any) => cat._id === category
      );
      return foundCategory ? foundCategory.name : 'Unknown Category';
    }

    // If `category` is an object, extract `_id`
    if (typeof category === 'object' && category._id) {
      const foundCategory = this.categories.find(
        (cat: any) => cat._id === category._id
      );
      return foundCategory ? foundCategory.name : 'Unknown Category';
    }

    return 'Unknown Category';
  }
  preloadImage(url: string, callback: (exists: boolean) => void) {
    const img = new Image();
    img.src = url;
    img.onload = () => callback(true);
    img.onerror = () => callback(false);
  }

  // ✅ Get Category Name by ID

  filteredProducts() {
    return this.products.filter((product) =>
      product.name.toLowerCase().includes(this.searchTerm.toLowerCase())
    );
  }
  getProductImage(product: any): string {
    console.log(' ,P:', product.name);

    if (!product || !product.name) {
      console.log('❌ No product found, using default image.');
      return `${this.apiUrl}/assets/products/default.jpg`; // Use default image
    }

    // ✅ Check if product has colors
    if (product.details?.color && product.details.color.length > 0) {
      const color = product.details.color[0]?.color; // Get first color
      if (color) {
        return `${this.apiUrl}/assets/products/${product.name}_${color}.jpg`;
      }
    }

    // ✅ Default case: product without colors
    return `${this.apiUrl}/assets/products/${product.name}.jpg`;
  }

  // ✅ Handle Image Fallback if Not Found
  onImageError(event: any, product: any) {
    console.log(`⚠️ Image failed to load: ${event.target.src}`);
    console.log('PKKK:', product);

    // Check for color variation
    if (product?.details?.color?.length > 0) {
      const color = product.details.color[0]?.color;
      if (color) {
        const fallbackImage = `${this.apiUrl}/assets/products/${product.name}_${color}.jpg`;
        console.log(`🔄 Trying fallback image: ${fallbackImage}`);

        event.target.src = fallbackImage; // Try alternative image
        return;
      }
    }

    // ✅ Final fallback to default image
    console.log('❌ Both images missing, using default.');
    event.target.src = `${this.apiUrl}/assets/products/default.jpg`;
  }
  openEditDialog(product: any) {
    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '600px',
      data: product,
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.fetchProducts(); // Refresh products after edit
      }
    });
  }

  deleteProduct(productId: string) {
    if (confirm('Are you sure you want to delete this product?')) {
      this.productService.deleteProduct(productId).subscribe(
        (response) => {
          console.log('✅ Product deleted:', response);
          this.fetchProducts(); // Refresh list
        },
        (error) => {
          console.error('❌ Error deleting product:', error);
          alert('❌ Failed to delete product. Try again.');
        }
      );
    }
  }

  saveChanges() {
    this.productService.updateProduct(this.editingProduct).subscribe(
      () => {
        this.fetchProducts();
        this.editingProduct = null;
      },
      (error) => {
        console.error('❌ Error updating product:', error);
      }
    );
  }

  confirmDelete(productId: string) {
    this.deletingProductId = productId;
  }
}
