import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';
import { environment } from '../../../../environments/environment'; // Import environment

@Component({
  selector: 'app-admin-category',
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css'],
})
export class AdminCategoryComponent implements OnInit {
  categories: any[] = [];
  newCategoryName: string = '';
  editingCategory: any = null;
  isLoading: boolean = false;
  errorMessage: string = '';
  selectedFile: any = null;
  selectedEditFile: any = null;
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
  }
  // ✅ Convert File to Base64 for Local Storage
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
  onImageError(event: any) {
    event.target.src = this.apiUrl + '/assets/products/default.jpg';
  }
  // ✅ Save Image to Local Storage
  async saveImageToLocal(categoryName: string, file: File) {
    const base64Image = await this.convertFileToBase64(file);
    localStorage.setItem(`category_${categoryName}`, base64Image);
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categories = data;
        this.isLoading = false;
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
        this.errorMessage = 'Failed to load categories.';
        this.isLoading = false;
      }
    );
  }

  // ✅ Handle File Selection
  onFileSelected(event: any) {
    this.selectedFile = event.target.files[0];
  }

  onEditFileSelected(event: any) {
    this.selectedEditFile = event.target.files[0];
  }

  // ✅ Add Category with Image
  addCategory(): void {
    if (!this.newCategoryName.trim() || !this.selectedFile) {
      alert('Both category name and image are required!');
      return;
    }

    this.categoryService
      .addCategory(this.newCategoryName, this.selectedFile)
      .subscribe(
        (response: any) => {
          alert('Category added successfully!');
          this.newCategoryName = '';
          this.selectedFile = null;
          this.loadCategories();
        },
        (error: any) => {
          console.error('Error adding category:', error);
        }
      );
  }

  // ✅ Edit Category
  editCategory(category: any): void {
    this.editingCategory = { ...category };
    this.selectedEditFile = null;
  }

  // ✅ Update Category (Supports Name & Image)
  updateCategory(): void {
    if (!this.editingCategory.name.trim()) {
      alert('Category name cannot be empty.');
      return;
    }

    this.categoryService
      .updateCategory(
        this.editingCategory._id,
        this.editingCategory.name,
        this.selectedEditFile
      )
      .subscribe(
        (response: any) => {
          alert('Category updated successfully!');
          this.editingCategory = null;
          this.selectedEditFile = null;
          this.loadCategories();
        },
        (error: any) => {
          console.error('Error updating category:', error);
        }
      );
  }

  // ✅ Delete Category
  deleteCategory(categoryId: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe(
        (response: any) => {
          alert('Category deleted successfully!');
          this.loadCategories();
        },
        (error: any) => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }
}
