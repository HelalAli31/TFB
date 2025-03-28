import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { MaterialModule } from './material-module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './containers/home/home.component';
import { NavIconComponent } from './components/Home/nav-icon/nav-icon.component';
import { Section1Component } from './components/Home/AboutUs/section1.component';
import { Section2Component } from './components/Home/Category/section2.component';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { Section4Component } from './components/Home/Top_Products/section4.component';
// import { ServiceComponent } from './components/services/service/service.component';
import { LoginComponent } from './components/Home/login/login.component';
import { RegisterComponent } from './components/Home/register/register.component';
import { ContactUsComponent } from './containers/contact-us/contact-us.component';
import { BottomSideComponent } from './components/Home/BottomSide/bottom-side.component';
import { FilterByCategoryPipe } from './pipes/filter-by-category.pipe';
import { ContactHomeComponent } from './components/Home/contact-home/contact-home.component';
import { ProductsComponent } from './containers/products/products.component';
import { CartComponent } from './containers/cart/cart.component';
import { MatSliderModule } from '@angular/material/slider';
import { MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { FilterPipe } from './components/pipe/filter.pipe';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatTableModule } from '@angular/material/table';
import { QuantityDialogComponent } from './components/PopUpComponents/quantity-dialog/quantity-dialog.component';
import { ProductDetailComponent } from './components/product-detail/product-detail.component';
import { NavBarComponent } from './containers/nav-bar/nav-bar.component';
import { AdminNavBarComponent } from './components/admin/admin-nav-bar/admin-nav-bar.component';
import { AdminTopProductsComponent } from './components/admin/admin-top-products/admin-top-products.component';
import { PopUpDeleteItemComponent } from './components/PopUpComponents/pop-up-delete-item/pop-up-delete-item.component';
import { AdminCategoryComponent } from './components/admin/admin-category/admin-category.component';
import { AdminAddProductComponent } from './components/admin/admin-add-product/admin-add-product.component';
import { AdminProductManagementComponent } from './components/admin/admin-product-management/admin-product-management.component';
import { EditProductDialogComponent } from './components/PopUpComponents/admin/edit-product-dialog/edit-product-dialog.component';
import { AboutUsComponent } from './containers/about-us/about-us.component';
import { BulkSaleComponent } from './containers/bulk-sale/bulk-sale.component';
import { ProfileComponent } from './containers/profile/profile.component';
import { PopUpOrderDetailsComponent } from './components/PopUpComponents/pop-up-order-details/pop-up-order-details.component';
import { DecimalPipe } from '@angular/common';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    NavIconComponent,
    Section1Component,
    Section2Component,
    Section4Component,
    LoginComponent,
    RegisterComponent,
    ContactUsComponent,
    BottomSideComponent,
    FilterByCategoryPipe,
    ContactHomeComponent,
    ProductsComponent,
    CartComponent,
    FilterPipe,
    QuantityDialogComponent,
    ProductDetailComponent,
    NavBarComponent,
    AdminNavBarComponent,
    AdminTopProductsComponent,
    PopUpDeleteItemComponent,
    AdminCategoryComponent,
    AdminAddProductComponent,
    AdminProductManagementComponent,
    EditProductDialogComponent,
    AboutUsComponent,
    BulkSaleComponent,
    ProfileComponent,
    PopUpOrderDetailsComponent, // Add the new component here
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxMaterialTimepickerModule,
    MatCardModule,
    MatSliderModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatTableModule,
  ],
  providers: [
    MatDatepickerModule,
    DecimalPipe, // Add DecimalPipe for number formatting
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
