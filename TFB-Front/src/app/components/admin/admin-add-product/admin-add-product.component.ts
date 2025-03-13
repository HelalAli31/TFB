import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';

@Component({
  selector: 'app-admin-add-product',
  templateUrl: './admin-add-product.component.html',
  styleUrls: ['./admin-add-product.component.css'],
})
export class AdminAddProductComponent {
  productForm: FormGroup;
  previewImage: string | null = null;
  selectedFile: File | null = null;
  categories: any[] = [];
  isLoading: boolean = false;
  colorImages: { [color: string]: string | null } = {}; // Store color images
  colorsWithDetails: {
    color: string;
    quantity: number;
    image?: File | null;
  }[] = []; // Store color, quantity & image

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    private categoryService: CategoryService
  ) {
    this.productForm = this.fb.group({
      name: ['', Validators.required],
      brand: ['', Validators.required],
      category: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
      quantity: ['', [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      sale: this.fb.group({
        isOnSale: [false],
      }),
      details: this.fb.group({}),
    });
  }

  ngOnInit(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categories = data;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
        this.isLoading = false;
      }
    );
  }

  // ✅ Handle Main Product Image Selection
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.previewImage = await this.convertFileToBase64(file);
    }
  }

  // ✅ Handle Color Image Selection
  async onColorImageSelected(event: any, color: string) {
    const file = event.target.files[0];
    if (file) {
      this.colorImages[color] = await this.convertFileToBase64(file);
      const colorEntry = this.colorsWithDetails.find((c) => c.color === color);
      if (colorEntry) {
        colorEntry.image = file;
      }
    }
  }

  // ✅ Convert File to Base64 (For Preview)
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  // ✅ Add New Color with Quantity
  addColor(colorInput: any, quantityInput: any) {
    const color = colorInput.value.trim().toLowerCase();
    const quantity = parseInt(quantityInput.value, 10);

    if (
      color &&
      quantity >= 0 &&
      !this.colorsWithDetails.find((c) => c.color === color)
    ) {
      this.colorsWithDetails.push({ color, quantity, image: null });
      this.colorImages[color] = null; // Placeholder
    }

    colorInput.value = '';
    quantityInput.value = '';
  }

  // ✅ Generate Image Filenames
  getImageFilename(): string {
    const name = this.productForm.value.name.replace(/\s+/g, '').toLowerCase();
    return `${name}.jpg`;
  }

  getColorImageFilename(color: string): string {
    const name = this.productForm.value.name.replace(/\s+/g, '').toLowerCase();
    return `${name}_${color}.jpg`;
  }

  // ✅ Submit Product with Multiple Images
  async onSubmit() {
    if (this.productForm.invalid) {
      alert('⚠️ Please fill all required fields.');
      return;
    }

    // ✅ Prepare product data
    const productData: any = {
      ...this.productForm.value,
      details: { ...this.productForm.value.details },
    };

    // ✅ Store color details with image filenames
    const colorImageFiles: { [color: string]: File } = {};
    const colorImagePaths: { [color: string]: string } = {};

    for (const colorData of this.colorsWithDetails) {
      if (colorData.image) {
        colorImageFiles[colorData.color] = colorData.image;
        colorImagePaths[
          colorData.color
        ] = `/assets/products/${this.getColorImageFilename(colorData.color)}`;
      }
    }

    // ✅ Save color image paths in product details (Ensure it's an object, not a string)
    if (Object.keys(colorImagePaths).length > 0) {
      productData.details.colorImages = colorImagePaths;
    }

    // ✅ Send Data to Backend
    this.productService
      .addProduct(productData, this.selectedFile || null, colorImageFiles)
      .subscribe(
        (response: any) => {
          alert('✅ Product added successfully!');
          console.log('Added Product:', response);
          this.resetForm();
        },
        (error) => {
          console.error('Error adding product:', error);
        }
      );
  }

  // ✅ Reset Form After Submission
  resetForm() {
    this.productForm.reset();
    this.productForm.patchValue({ sale: { isOnSale: false } });
    this.previewImage = null;
    this.colorImages = {};
    this.colorsWithDetails = [];
  }
}
