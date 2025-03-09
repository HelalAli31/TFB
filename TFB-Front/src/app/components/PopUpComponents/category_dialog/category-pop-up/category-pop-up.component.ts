import { Component, Inject, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-category-pop-up',
  templateUrl: './category-pop-up.component.html',
  styleUrls: ['./category-pop-up.component.css'],
})
export class CategoryPopUpComponent implements OnInit {
  public categoryName: string;
  public ActionName: string;
  public SelectedCategory: any;
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any = { data },
    public dialogRef: MatDialogRef<CategoryPopUpComponent>
  ) {
    this.categoryName = '';
    if (data?.category) this.ActionName = 'Edit';
    else this.ActionName = 'Add';
  }

  Close() {
    let category: any = {};
    this.data?.category
      ? (category = { _id: this.SelectedCategory, name: this.categoryName })
      : (category = this.categoryName);
    this.dialogRef.close({
      category,
    });
  }

  ngOnInit(): void {
    this.SelectedCategory = this.data?.category;
  }
}
