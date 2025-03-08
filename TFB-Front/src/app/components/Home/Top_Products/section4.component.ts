import { Component, OnInit } from '@angular/core';
import { ProductService } from 'src/app/serverServices/productService/product.service';

@Component({
  selector: 'app-section4',
  templateUrl: './section4.component.html',
  styleUrls: ['./section4.component.css'],
})
export class Section4Component implements OnInit {
  public products: any[] = [];
  public groupedProducts: { [category: string]: any[] } = {}; // Grouped products by category

  constructor(private productService: ProductService) {}

  get_products() {
    this.productService.getProducts().subscribe(
      (result: any) => {
        // ✅ Ensure result contains a "products" array
        if (!result || !Array.isArray(result.products)) {
          console.error('❌ Products data is not an array:', result);
          this.products = [];
          return;
        }

        this.products = result.products; // ✅ Extract products array
        console.log('✅ Products:', JSON.stringify(this.products, null, 2));

        // ✅ Ensure each category is properly formatted before grouping
        this.groupedProducts = this.products.reduce((acc, product) => {
          let categoryName = '';

          if (product.category) {
            if (typeof product.category === 'object' && product.category.name) {
              categoryName = product.category.name; // ✅ Use category name if it's an object
            } else {
              categoryName = String(product.category); // ✅ Convert to string in case of mismatch
            }
          } else {
            categoryName = 'Uncategorized'; // ✅ Handle products without a category
          }

          if (!acc[categoryName]) {
            acc[categoryName] = [];
          }

          acc[categoryName].push(product);
          return acc;
        }, {});

        console.log('✅ Grouped Products:', this.groupedProducts);
      },
      (error: any) => {
        console.error('❌ Error fetching products:', error);
      }
    );
  }

  ngOnInit(): void {
    this.get_products();
  }
}
