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
    MatIconModule,
    MatSliderModule,
    MatButtonModule,
    MatDialogModule,
    CommonModule,
    FormsModule, // ✅ Fixes ngModel errors
    MatIconModule, // ✅ Fixes <mat-icon> errors
    MatSliderModule, // ✅ Fixes <mat-slider> errors
    MatFormFieldModule, // ✅ Fixes <mat-form-field> errors
    MatInputModule, // ✅ Fixes <mat-input> errors
    MatDatepickerModule, // ✅ Fixes <mat-datepicker> errors
    MatNativeDateModule, // ✅ Required for DatePicker
    MatDialogModule, // ✅ Fixes Material Dialog issues
    MatTableModule, // ✅ Fixes Material Tables
  ],
  providers: [MatDatepickerModule],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
