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
  optionImages: { [option: string]: File | null } = {}; // Option image files
  categoriesList: any[] = []; // ✅ Store fetched categories
  calculatedSalePrice: number = 0;
  saleStartDate: string | null = null;
  saleEndDate: string | null = null;
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
      // ✅ Always include sale fields
      // ✅ Sale Fields (Always Present)
      isOnSale: [this.product.sale?.isOnSale || false],
      salePercent: [
        {
          value: this.product.sale?.salePercent || 0,
          disabled: !this.product.sale?.isOnSale,
        },
        [Validators.min(1), Validators.max(100)],
      ],
      saleStartDate: [
        {
          value: this.formatDate(this.product.sale?.saleStartDate) || '',
          disabled: !this.product.sale?.isOnSale,
        },
      ],
      saleEndDate: [
        {
          value: this.formatDate(this.product.sale?.saleEndDate) || '',
          disabled: !this.product.sale?.isOnSale,
        },
      ],

      description: [this.product.description, Validators.required],
      details: this.fb.group({
        wattage: [this.product.details?.wattage || ''],
        capacity: [this.product.details?.capacity || ''],
        customerType: [this.product.details?.customerType || ''],
        options: this.fb.array([]),
      }),
    });

    if (
      this.product.details?.options &&
      this.product.details.options.length > 0
    ) {
      this.setOptionsFormArray(this.product.details.options);
    }
    if (this.product.sale) {
      this.saleStartDate = this.formatDate(this.product.sale?.saleStartDate);
      this.saleEndDate = this.formatDate(this.product.sale?.saleEndDate);
      this.calculatedSalePrice = this.calculateSalePrice();
    }
  }
  // ✅ Convert date to YYYY-MM-DD format for input fields
  formatDate(date: any): string | null {
    if (!date) return null;
    return new Date(date).toISOString().split('T')[0]; // Convert to 'YYYY-MM-DD'
  }
  ngOnInit() {
    this.fetchCategories(); // ✅ Fetch categories on component load
    this.calculatedSalePrice = this.product.price;
  }
  toggleSale() {
    const isOnSale = this.editProductForm.get('isOnSale')?.value;

    if (isOnSale) {
      this.editProductForm.get('salePercent')?.enable();
      this.editProductForm.get('saleStartDate')?.enable();
      this.editProductForm.get('saleEndDate')?.enable();
      this.updateSalePrice();
    } else {
      this.editProductForm.get('salePercent')?.disable();
      this.editProductForm.get('saleStartDate')?.disable();
      this.editProductForm.get('saleEndDate')?.disable();
      this.editProductForm.patchValue({
        salePercent: null,
        salePrice: null,
        saleStartDate: null,
        saleEndDate: null,
      });
    }
  }

  updateSalePrice() {
    const salePercent = this.editProductForm.get('salePercent')?.value;
    this.calculatedSalePrice = this.calculateSalePrice();
    this.editProductForm.patchValue({ salePrice: this.calculatedSalePrice });
  }

  calculateSalePrice(): number {
    const salePercent = this.editProductForm.get('salePercent')?.value || 0;
    const originalPrice = this.editProductForm.get('price')?.value || 0;
    return salePercent > 0
      ? (originalPrice * (100 - salePercent)) / 100
      : originalPrice;
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
  // ✅ Ensure `optionCtrl` is treated as FormGroup
  getOptionFormGroup(control: AbstractControl | null): FormGroup {
    return control as FormGroup;
  }

  // ✅ Get the options FormArray safely
  get optionsArray(): FormArray {
    return this.editProductForm.get('details.options') as FormArray;
  }

  // ✅ Initialize the Options FormArray when options exist
  setOptionsFormArray(options: any[]) {
    this.optionsArray.clear(); // Prevent duplicates

    options.forEach((optionObj) => {
      this.optionsArray.push(
        this.fb.group({
          option: [optionObj.option, Validators.required],
          quantity: [
            optionObj.quantity,
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
  // ✅ Add new option with quantity and optional image
  addOption(optionInput: any, quantityInput: any, fileInput: any) {
    const optionName = optionInput.value.trim(); // ✅ Keep spaces in option name
    const quantity = parseInt(quantityInput.value, 10);
    const file = fileInput.files[0]; // ✅ Get the selected image file

    if (optionName && quantity >= 0) {
      // ✅ Push new option into form array
      this.optionsArray.push(
        this.fb.group({
          option: [optionName, Validators.required],
          quantity: [quantity, [Validators.required, Validators.min(0)]],
        })
      );

      // ✅ Store the new option image
      if (file) {
        this.optionImages[optionName] = file; // ✅ Keep spaces in option name
      }

      console.log(
        `✅ Added option: "${optionName}" with quantity: ${quantity}`
      );
    } else {
      alert('❌ Please enter a valid option name and quantity.');
    }

    // ✅ Reset input fields after adding
    optionInput.value = '';
    quantityInput.value = '';
    fileInput.value = '';
  }

  // ✅ Remove Option & Image
  removeOption(index: number) {
    const removedOption = this.optionsArray.at(index).value.option;
    this.optionsArray.removeAt(index);

    if (this.optionImages[removedOption]) {
      delete this.optionImages[removedOption]; // ✅ Remove from pending uploads
    }

    // ✅ Send request to delete image on backend
    this.productService
      .deleteOptionImage(this.product._id, removedOption)
      .subscribe(
        (response: any) =>
          console.log(`✅ Deleted option image: ${removedOption}.jpg`),
        (error: any) =>
          console.error(
            `❌ Error deleting option image: ${removedOption}.jpg`,
            error
          )
      );
  }
  cancel() {
    this.dialogRef.close(); // ✅ Add parentheses to properly close the dialog
  }
  // ✅ Remove Sale Function
  removeSale() {
    this.editProductForm.patchValue({
      isOnSale: false,
      salePercent: '',
      saleStartDate: '',
      saleEndDate: '',
    });

    this.toggleSale(); // ✅ Apply disable logic
  }

  // ✅ Handle Option Image Selection
  onOptionImageSelected(event: any, option: string) {
    const file = event.target.files[0];
    if (file) {
      this.optionImages[option] = file; // ✅ Keep spaces in the option name
      console.log(`🖼️ New image selected for option: ${option}`);
    }
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
    formData.append('isOnSale', updatedProduct.isOnSale);
    formData.append('salePercent', updatedProduct.salePercent || '');
    formData.append('saleStartDate', updatedProduct.saleStartDate || '');
    formData.append('saleEndDate', updatedProduct.saleEndDate || '');
    // ✅ Append new main image (if changed)
    if (this.selectedImage) {
      formData.append('image', this.selectedImage);
    }

    // ✅ Append new option images
    Object.entries(this.optionImages).forEach(([option, file]) => {
      if (file) {
        const filename = `${option}.jpg`; // ✅ Keep spaces in database
        formData.append('optionImages', file, filename); // ✅ Modify only when saving
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
