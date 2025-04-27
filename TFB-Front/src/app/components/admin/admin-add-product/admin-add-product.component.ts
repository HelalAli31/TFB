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
  optionImages: { [option: string]: string | null } = {}; // Store option images
  optionsWithDetails: {
    option: string;
    quantity: number;
    image?: File | null;
  }[] = []; // Store option, quantity & image

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
        salePrice: [''],
        saleStartDate: [''],
        saleEndDate: [''],
      }),
      details: this.fb.group({
        wattage: [null], // Optional
        capacity: [null], // Optional
      }),
    });
  }
  get detailsForm(): FormGroup {
    return this.productForm.get('details') as FormGroup;
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

  // ✅ Handle option Image Selection
  async onoptionImageselected(event: any, option: string) {
    const file = event.target.files[0];
    if (file) {
      this.optionImages[option] = await this.convertFileToBase64(file);
      const optionEntry = this.optionsWithDetails.find(
        (c) => c.option === option
      );
      if (optionEntry) {
        optionEntry.image = file;
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

  // ✅ Add New option with Quantity
  addOption(optionInput: any, quantityInput: any) {
    const option = optionInput.value.trim().toLowerCase();
    const quantity = parseInt(quantityInput.value, 10);

    if (
      option &&
      quantity >= 0 &&
      !this.optionsWithDetails.find((c) => c.option === option)
    ) {
      this.optionsWithDetails.push({ option, quantity, image: null });
      this.optionImages[option] = null; // Placeholder
    }

    optionInput.value = '';
    quantityInput.value = '';
  }

  // ✅ Generate Image Filenames
  getImageFilename(): string {
    const name = this.productForm.value.name.toLowerCase();
    return `${name}.jpg`;
  }

  getoptionImageFilename(option: string): string {
    const name = this.productForm.value.name.toLowerCase();
    return `${name}_${option}.jpg`;
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
      details: {
        ...this.productForm.value.details,
        name: this.productForm.value.name.trim(),
        options: this.optionsWithDetails, // ✅ Include options array inside details
      },
    };

    // ✅ Store option details with image filenames
    let optionImageFiles: { [option: string]: File } | null = null;

    if (this.optionsWithDetails.length > 0) {
      optionImageFiles = {}; // ✅ Initialize only if there are option images
      for (const optionData of this.optionsWithDetails) {
        if (optionData.image) {
          optionImageFiles[optionData.option] = optionData.image;
        }
      }
    }

    // ✅ Send Data to Backend
    this.productService
      .addProduct(productData, this.selectedFile || null, optionImageFiles)
      .subscribe(
        (response: any) => {
          alert('✅ Product added successfully!');
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
    this.optionImages = {};
    this.optionsWithDetails = [];
  }
}
