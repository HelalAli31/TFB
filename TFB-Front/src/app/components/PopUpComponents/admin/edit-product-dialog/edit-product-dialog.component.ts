import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ProductService } from 'src/app/serverServices/productService/product.service';

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

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    public dialogRef: MatDialogRef<EditProductDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public product: any
  ) {
    this.editProductForm = this.fb.group({
      name: [product.name, Validators.required],
      brand: [product.brand, Validators.required],
      category: [product.category, Validators.required],
      price: [product.price, [Validators.required, Validators.min(0)]],
      quantity: [product.quantity, [Validators.required, Validators.min(0)]],
      description: [product.description, Validators.required],
      details: this.fb.group({
        wattage: [product.details?.wattage || ''],
        capacity: [product.details?.capacity || ''],
        customerType: [product.details?.customerType || ''],
      }),
    });
  }

  // ✅ Handle Main Image Change
  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.previewImage = await this.convertFileToBase64(file);
    }
  }

  // ✅ Handle Color Image Change
  async onColorImageSelected(event: any, color: string) {
    const file = event.target.files[0];
    if (file) {
      this.colorImages[color] = file;
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

  // ✅ Add New Color
  addColor(colorInput: any, quantityInput: any) {
    const color = colorInput.value.trim().toLowerCase();
    const quantity = parseInt(quantityInput.value, 10);

    if (
      color &&
      quantity >= 0 &&
      !this.product.details?.color?.find((c: any) => c.color === color)
    ) {
      this.product.details.color.push({ color, quantity });
    }

    colorInput.value = '';
    quantityInput.value = '';
  }

  // ✅ Remove Color
  removeColor(color: string) {
    this.product.details.color = this.product.details.color.filter(
      (c: any) => c.color !== color
    );
  }

  // ✅ Submit Updated Product
  onSubmit() {
    if (this.editProductForm.invalid) {
      alert('⚠️ Please fill all required fields.');
      return;
    }

    const updatedProduct = {
      ...this.editProductForm.value,
      details: {
        ...this.editProductForm.value.details,
        color: this.product.details.color,
      },
      _id: this.product._id, // Ensure we send the ID
    };

    this.productService
      .updateProduct(updatedProduct, this.selectedImage)
      .subscribe(
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
