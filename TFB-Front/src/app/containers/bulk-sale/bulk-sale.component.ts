import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';

@Component({
  selector: 'app-bulk-sale',
  templateUrl: './bulk-sale.component.html',
  styleUrls: ['./bulk-sale.component.css'],
})
export class BulkSaleComponent implements OnInit {
  categoriesList: any[] = [];
  selectedCategories: { [key: string]: boolean } = {};
  selectAll: boolean = false;
  salePercent: number = 0;
  saleStartDate: string = '';
  saleEndDate: string = '';
  public isAdmin: any;

  constructor(
    private categoryService: CategoryService,
    private productService: ProductService
  ) {}

  ngOnInit(): void {
    this.fetchCategories();
    this.isAdmin = getIsAdmin();
  }

  // ✅ Fetch all categories
  fetchCategories() {
    this.categoryService.getCategories().subscribe(
      (data: any) => {
        this.categoriesList = data;
        // ✅ Initialize selected categories object
        this.categoriesList.forEach((category) => {
          this.selectedCategories[category._id] = false;
        });
      },
      (error) => console.error('❌ Error fetching categories:', error)
    );
  }

  // ✅ Toggle Select All Categories
  toggleSelectAll() {
    Object.keys(this.selectedCategories).forEach((id) => {
      this.selectedCategories[id] = this.selectAll;
    });
  }

  // ✅ Check if sale is valid before applying
  isValidSale(): boolean {
    return (
      this.salePercent > 0 &&
      this.salePercent <= 100 &&
      this.saleStartDate !== '' &&
      this.saleEndDate !== '' &&
      Object.values(this.selectedCategories).some((val) => val) // At least one category must be selected
    );
  }

  // ✅ Apply sale to all selected categories
  applySale() {
    const selectedCategoryIds = Object.keys(this.selectedCategories).filter(
      (id) => this.selectedCategories[id]
    );

    if (selectedCategoryIds.length === 0) {
      alert('❌ Please select at least one category.');
      return;
    }

    const saleData = {
      categories: selectedCategoryIds,
      salePercent: this.salePercent,
      saleStartDate: this.saleStartDate,
      saleEndDate: this.saleEndDate,
    };

    this.productService
      .applyBulkSale(
        saleData.categories, // ✅ Correct key name
        saleData.salePercent,
        saleData.saleStartDate,
        saleData.saleEndDate
      )

      .subscribe(
        (response) => {
          alert('✅ Sale applied successfully:');
          window.location.reload();
        },
        (error) => {
          alert('❌ Error applying sale:' + error);
        }
      );
  }
}
