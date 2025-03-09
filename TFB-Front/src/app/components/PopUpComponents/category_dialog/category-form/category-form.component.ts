import { Component, Inject, OnInit } from '@angular/core';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { CategoryService } from 'src/app/service/categoryService/category.service';
import { CategoryPopUpComponent } from '../category-pop-up/category-pop-up.component';

@Component({
  selector: 'app-category-form',
  templateUrl: './category-form.component.html',
  styleUrls: ['./category-form.component.css'],
})
export class CategoryFormComponent implements OnInit {
  public categories: any;
  public editCategory: boolean;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { category: any },
    public dialogRef: MatDialogRef<CategoryFormComponent>,
    public dialog: MatDialog,
    private categoryService: CategoryService
  ) {
    this.categories = [];
    this.editCategory = false;
  }

  async addCategory() {
    const dialogRef = this.dialog.open(CategoryPopUpComponent);
    dialogRef.afterClosed().subscribe(async (result) => {
      if (!result) return;
      console.log(result);
      await this.categoryService.addCategory({ name: result.category });
      await this.getCategories();
      console.log(this.categories);
    });
  }
  EditDetails() {
    this.editCategory = true;
    console.log(this.editCategory);
  }

  async editCategoryName() {
    const category = this.categories;
    const dialogRef2 = this.dialog.open(CategoryPopUpComponent, {
      data: { category },
    });
    dialogRef2.afterClosed().subscribe(async (result) => {
      if (!result) return;
      console.log(result);
      this.categoryService.editCategoryName({
        _id: result.category._id,
        name: result.category.name,
      });
      await this.getCategories();
    });
  }

  async getCategories() {
    this.categoryService.getCategories().then(
      (result: any) => {
        this.categories = result;
        console.log(result);
      },
      (reason) => {
        console.log(reason);
      }
    );
    console.log(this.categories);
  }
  async ngOnInit() {
    await this.getCategories();
  }
}
