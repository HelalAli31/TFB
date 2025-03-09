import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filter',
})
export class FilterPipe implements PipeTransform {
  transform(items: Array<any>, ...args: any[]): any {
    const [value] = args;
    if (!value) return items;
    const filteredItems = items.filter((item) => {
      return (
        // item.product_id.type.toString().includes(value) ||
        item.product_id.title.toString().includes(value)
      );
    });
    return filteredItems;
  }
}
