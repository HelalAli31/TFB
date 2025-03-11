import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactUsComponent } from './containers/contact-us/contact-us.component';
import { HomeComponent } from './containers/home/home.component';
import { ProductsComponent } from './containers/products/products.component';
import { CartComponent } from './containers/cart/cart.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { AdminTopProductsComponent } from './components/admin/admin-top-products/admin-top-products.component';
import { AdminCategoryComponent } from './components/admin/admin-category/admin-category.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contactUs', component: ContactUsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  {
    path: 'category',
    component: AdminCategoryComponent,
  },

  { path: 'topProducts', component: AdminTopProductsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
