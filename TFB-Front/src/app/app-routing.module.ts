import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ContactUsComponent } from './containers/contact-us/contact-us.component';
import { HomeComponent } from './containers/home/home.component';
import { ProductsComponent } from './containers/products/products.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'contactUs', component: ContactUsComponent },
  { path: 'products', component: ProductsComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
