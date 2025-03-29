import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './components/Home/login/login.component';
import getPayload from './serverServices/Payload/getPayload';
import { CategoryService } from './serverServices/categoryService/category.service';
import { ProductService } from './serverServices/productService/product.service';
import { Router } from '@angular/router';
import getIsAdmin from './serverServices/Payload/isAdmin';
import { LanguageService } from './serverServices/language.service'; // Import the language service

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'The Fog Bank';
  public token: any = '';
  public isAdmin: any;

  constructor(
    public dialog: MatDialog,
    private languageService: LanguageService // Inject the language service
  ) {
    // The language initialization should be handled by the LanguageService
    // We just need to make sure the RTL class is applied if needed
    if (this.languageService.getDirection() === 'rtl') {
      document.body.classList.add('rtl');
      document.documentElement.dir = 'rtl';
      document.documentElement.lang =
        this.languageService.getCurrentLanguage().code;
      console.log('Added RTL class to body in AppComponent');
    }
  }

  ngOnInit() {
    this.token = localStorage.getItem('token') || '';
    this.isAdmin = getIsAdmin();
    console.log(this.isAdmin, ' :ADMIN');
    localStorage.setItem('preferredLanguage', 'en');
    // Subscribe to language changes to update RTL class
    this.languageService.currentLanguage$.subscribe((language) => {
      const dir = language.direction;
      document.documentElement.dir = dir;
      document.documentElement.lang = language.code;

      if (dir === 'rtl') {
        document.body.classList.add('rtl');
      } else {
        document.body.classList.remove('rtl');
      }
    });

    // Log to check if RTL class is applied
    console.log('Body has RTL class:', document.body.classList.contains('rtl'));
  }
}
