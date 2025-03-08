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
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    MatCardModule,
    MaterialModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    NgxMaterialTimepickerModule,
  ],
  providers: [],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],
})
export class AppModule {}
