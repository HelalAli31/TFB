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
  editingProduct: any = null;
  deletingProductId: string | null = null;
  public categories: any = [];
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment
  selectedImage: File | null = null;
  filteredProducts: any[] = [];
  searchTerm: string = '';
  searchType: string = 'name'; // Default search type

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
  async fetchProducts() {
    await this.productService.getProducts().subscribe(
      (data: any) => {
        this.products = data.products || [];
        this.filteredProducts = this.products; // Show all products initially
      },
      (error: any) => console.error('❌ Error fetching products:', error)
    );
  }

  // ✅ Search based on selected type (name, category, brand)
  filterProducts() {
    const search = this.searchTerm.toLowerCase().trim();

    if (!search) {
      this.filteredProducts = this.products; // Reset when empty
      return;
    }

    this.filteredProducts = this.products.filter((product) => {
      const productName = product.name.toLowerCase();
      const productBrand = product.brand.toLowerCase();
      const categoryName = this.getCategoryName(product.category).toLowerCase();

      switch (this.searchType) {
        case 'name':
          return productName.includes(search);
        case 'brand':
          return productBrand.includes(search);
        case 'category':
          return categoryName.includes(search);
        default:
          return productName.includes(search); // Default to name search
      }
    });
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

    // ✅ Final fallback to default image
    console.log('❌ Both images missing, using default.');
    event.target.src = `${this.apiUrl}/assets/products/default.jpg`;
  }
  openEditDialog(product: any) {
    const editedProduct = { ...product };

    if (editedProduct.category && typeof editedProduct.category === 'object') {
      console.log('⚠️ `category` is an object, extracting `_id` and `name`...');
      editedProduct.category = {
        _id: editedProduct.category._id || '',
        name: editedProduct.category.name || 'Unknown Category',
      };
    } else {
      console.log('✅ `category` is already an ID:', editedProduct.category);
      editedProduct.category = {
        _id: editedProduct.category,
        name: this.getCategoryName(editedProduct.category), // Get category name if only ID is available
      };
    }

    console.log('🔍 Opening edit dialog with product:', editedProduct);

    const dialogRef = this.dialog.open(EditProductDialogComponent, {
      width: '600px',
      data: editedProduct, // ✅ Pass complete category data
    });

    dialogRef.afterClosed().subscribe((result: any) => {
      if (result) {
        this.fetchProducts(); // Refresh products after edit
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
    }
  }
  saveChanges() {
    if (!this.editingProduct) return;

    const formData = new FormData();
    formData.append('name', this.editingProduct.name);
    formData.append('brand', this.editingProduct.brand);
    formData.append('category', this.editingProduct.category);
    formData.append('price', this.editingProduct.price);
    formData.append('quantity', this.editingProduct.quantity);
    formData.append('description', this.editingProduct.description);

    // ✅ Convert `details` object to JSON string
    if (this.editingProduct.details) {
      formData.append('details', JSON.stringify(this.editingProduct.details));
    }

    // ✅ Ensure `selectedImage` exists before appending
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    this.productService
      .updateProduct(this.editingProduct._id, formData)
      .subscribe(
        (response) => {
          alert('✅ Product updated successfully!');
          this.fetchProducts(); // Refresh product list
          this.editingProduct = null;
          this.selectedImage = null; // Reset selected image
        },
        (error) => {
          console.error('❌ Error updating product:', error);
        }
      );
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

  confirmDelete(productId: string) {
    this.deletingProductId = productId;
  }
}
