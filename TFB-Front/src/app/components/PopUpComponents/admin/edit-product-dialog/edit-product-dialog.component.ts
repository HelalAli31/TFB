import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  AbstractControl,
} from '@angular/forms';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';

@Component({
  selector: 'app-edit-product-dialog',
  templateUrl: './edit-product-dialog.component.html',
  styleUrls: ['./edit-product-dialog.component.css'],
})
export class EditProductDialogComponent {
  editProductForm: FormGroup;
  previewImage: string | null = null;
  selectedImage: File | null = null;
  colorImages: { [color: string]: File | null } = {}; // Color image files
  categoriesList: any[] = []; // ✅ Store fetched categories

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    private categoryService: CategoryService, // ✅ Inject Category Service

    @Inject(MAT_DIALOG_DATA) public product: any
  ) {
    console.log('🛠️ Product received for editing:', this.product);

    this.editProductForm = this.fb.group({
      name: [this.product.name, Validators.required],
      brand: [this.product.brand, Validators.required],

      // ✅ Category dropdown (Store ID but show name)
      category: [this.product.category._id, Validators.required],

      price: [this.product.price, [Validators.required, Validators.min(0)]],
      quantity: [
        this.product.quantity,
        [Validators.required, Validators.min(0)],
      ],
      description: [this.product.description, Validators.required],
      details: this.fb.group({
        wattage: [this.product.details?.wattage || ''],
        capacity: [this.product.details?.capacity || ''],
        customerType: [this.product.details?.customerType || ''],
        color: this.fb.array([]),
      }),
    });

    if (this.product.details?.color && this.product.details.color.length > 0) {
      this.setColorFormArray(this.product.details.color);
    }
  }
  ngOnInit() {
    this.fetchCategories(); // ✅ Fetch categories on component load
  }

  // ✅ Fetch categories and store them
  fetchCategories() {
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categoriesList = data;
      },
      (error) => console.error('❌ Error fetching categories:', error)
    );
  }

  // ✅ Get the color FormArray safely
  get colorArray(): FormArray {
    return this.editProductForm.get('details.color') as FormArray;
  }

  // ✅ Ensure `colorCtrl` is treated as FormGroup
  getColorFormGroup(control: AbstractControl | null): FormGroup {
    return control as FormGroup;
  }

  // ✅ Initialize the Color FormArray when colors exist
  setColorFormArray(colors: any[]) {
    this.colorArray.clear(); // Prevent duplicates

    colors.forEach((colorObj) => {
      this.colorArray.push(
        this.fb.group({
          color: [colorObj.color, Validators.required],
          quantity: [
            colorObj.quantity,
            [Validators.required, Validators.min(0)],
          ],
        })
      );
    });
  }

  // ✅ Handle Main Image Change (Fixed)
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.previewImage = await this.convertFileToBase64(file);
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
  // ✅ Add New Color + Image
  addColor(colorInput: any, quantityInput: any, fileInput: any) {
    const color = colorInput.value.trim().toLowerCase();
    const quantity = parseInt(quantityInput.value, 10);
    const file = fileInput.files[0]; // Get the selected image file

    if (color && quantity >= 0) {
      this.colorArray.push(
        this.fb.group({
          color: [color, Validators.required],
          quantity: [quantity, [Validators.required, Validators.min(0)]],
        })
      );

      // ✅ Store the new color image
      if (file) {
        this.colorImages[color] = file;
      }
    }

    // Reset inputs
    colorInput.value = '';
    quantityInput.value = '';
    fileInput.value = '';
  }

  // ✅ Remove Color & Image
  removeColor(index: number) {
    const removedColor = this.colorArray.at(index).value.color;

    this.colorArray.removeAt(index);

    if (this.colorImages[removedColor]) {
      delete this.colorImages[removedColor]; // ✅ Remove from pending uploads
    }

    // ✅ Send request to delete image on backend
    this.productService
      .deleteColorImage(this.product._id, removedColor)
      .subscribe(
        (response: any) =>
          console.log(`✅ Deleted color image: ${removedColor}.jpg`),
        (error: any) =>
          console.error(
            `❌ Error deleting color image: ${removedColor}.jpg`,
            error
          )
      );
  }
  cancel() {
    this.dialogRef.close(); // ✅ Add parentheses to properly close the dialog
  }

  // ✅ Submit Updated Product
  onSubmit() {
    if (this.editProductForm.invalid) {
      alert('⚠️ Please fill all required fields.');
      return;
    }

    const updatedProduct = this.editProductForm.value;
    const formData = new FormData();

    formData.append('name', updatedProduct.name);
    formData.append('brand', updatedProduct.brand);
    formData.append('category', updatedProduct.category);
    formData.append('price', updatedProduct.price);
    formData.append('quantity', updatedProduct.quantity);
    formData.append('description', updatedProduct.description);
    formData.append('details', JSON.stringify(updatedProduct.details));

    // ✅ Append new main image (if changed)
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    // ✅ Append new color images
    Object.entries(this.colorImages).forEach(([color, file]) => {
      if (file) {
        formData.append('colorImages', file, `${color}.jpg`);
      }
    });

    this.productService.updateProduct(this.product._id, formData).subscribe(
      (response) => {
        alert('✅ Product updated successfully!');
        this.dialogRef.close(response.product);
      },
      (error) => {
        console.error('❌ Error updating product:', error);
      }
    );
  }
}
