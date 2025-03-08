import { Component, OnInit } from '@angular/core';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-section2',
  templateUrl: './section2.component.html',
  styleUrls: ['./section2.component.css'],
})
export class Section2Component implements OnInit {
  public cate: any;

  constructor(
    private categoryService: CategoryService,
    private router: Router
  ) {}

  get_categories() {
    this.categoryService.getCategories().subscribe(
      (result: any) => {
        this.cate = result;
      },
      (error: any) => {
        console.error('Error fetching categories:', error);
      }
    );
  }

  filterByCategory(category: string) {
    this.router.navigate(['/products'], { queryParams: { category } });
  }

  ngOnInit(): void {
    this.get_categories();
  }
}
