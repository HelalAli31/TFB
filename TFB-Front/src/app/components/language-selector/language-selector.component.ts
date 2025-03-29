import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../serverServices/language.service';

@Component({
  selector: 'app-language-selector',
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css'],
})
export class LanguageSelectorComponent implements OnInit {
  languages: any[] = [];
  currentLanguage: any;
  isDropdownOpen = false;

  constructor(private languageService: LanguageService) {
    this.languages = this.languageService.getLanguages();
    this.currentLanguage = this.languageService.getCurrentLanguage();
  }

  ngOnInit(): void {
    this.languageService.currentLanguage$.subscribe((language) => {
      this.currentLanguage = language;
    });
  }

  toggleDropdown(event: Event): void {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }

  changeLanguage(languageCode: string): void {
    this.languageService.setLanguage(languageCode);
    this.isDropdownOpen = false;
    // Your existing language switching code

    // Add this to set the correct direction
    if (languageCode === 'he') {
      document.documentElement.setAttribute('lang', 'he');
      document.documentElement.setAttribute('dir', 'rtl');
    } else {
      document.documentElement.setAttribute('lang', 'en');
      document.documentElement.setAttribute('dir', 'ltr');
    }
  }
}
