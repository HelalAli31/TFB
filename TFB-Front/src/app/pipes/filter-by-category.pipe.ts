import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterByCategory',
})
export class FilterByCategoryPipe implements PipeTransform {
  transform(products: any[], category: string): any[] {
    if (!products || !category) {
      return [];
    }
    return products.filter((product) => product.category === category);
  }
}
