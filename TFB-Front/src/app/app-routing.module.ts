import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactUsComponent } from './containers/contact-us/contact-us.component';
import { HomeComponent } from './containers/home/home.component';
import { ProductsComponent } from './containers/products/products.component';
import { CartComponent } from './containers/cart/cart.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { AdminTopProductsComponent } from './components/admin/admin-top-products/admin-top-products.component';
import { AdminCategoryComponent } from './components/admin/admin-category/admin-category.component';
import { AdminAddProductComponent } from './components/admin/admin-add-product/admin-add-product.component';
import { AdminProductManagementComponent } from './components/admin/admin-product-management/admin-product-management.component';
import { AboutUsComponent } from './containers/about-us/about-us.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contactUs', component: ContactUsComponent },
  { path: 'products', component: ProductsComponent },
  { path: 'cart', component: CartComponent },
  { path: 'aboutUs', component: AboutUsComponent },
  { path: 'addProduct', component: AdminAddProductComponent },
  { path: 'product/:id', component: ProductDetailComponent },
  { path: 'productManagment', component: AdminProductManagementComponent },

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
