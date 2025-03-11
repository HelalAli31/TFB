import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';

@Component({
  selector: 'app-admin-category',
  templateUrl: './admin-category.component.html',
  styleUrls: ['./admin-category.component.css'],
})
export class AdminCategoryComponent implements OnInit {
  categories: any[] = [];
  newCategoryName: string = '';
  editingCategory: any = null; // Stores the category being edited
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
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

  addCategory(): void {
    if (!this.newCategoryName.trim()) {
      alert('Category name cannot be empty.');
      return;
    }

    this.categoryService.addCategory(this.newCategoryName).subscribe(
      (response: any) => {
        alert('Category added successfully!');
        this.newCategoryName = '';
        this.loadCategories(); // Refresh the list
      },
      (error: any) => {
        console.error('Error adding category:', error);
      }
    );
  }

  editCategory(category: any): void {
    this.editingCategory = { ...category }; // Clone category for editing
  }

  updateCategory(): void {
    if (!this.editingCategory.name.trim()) {
      alert('Category name cannot be empty.');
      return;
    }

    this.categoryService
      .updateCategory(this.editingCategory._id, this.editingCategory.name)
      .subscribe(
        (response: any) => {
          alert('Category updated successfully!');
          this.editingCategory = null; // Close edit mode
          this.loadCategories(); // Refresh the list
        },
        (error: any) => {
          console.error('Error updating category:', error);
        }
      );
  }

  deleteCategory(categoryId: string): void {
    if (confirm('Are you sure you want to delete this category?')) {
      this.categoryService.deleteCategory(categoryId).subscribe(
        (response: any) => {
          alert('Category deleted successfully!');
          this.loadCategories(); // Refresh the list
        },
        (error: any) => {
          console.error('Error deleting category:', error);
        }
      );
    }
  }
}
