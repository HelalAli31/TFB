import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export interface LanguageConfig {
  code: string;
  name: string;
  direction: 'ltr' | 'rtl';
}

@Injectable({
  providedIn: 'root',
})
export class LanguageService {
  private languages: LanguageConfig[] = [
    { code: 'en', name: 'English', direction: 'ltr' },
    { code: 'he', name: 'עברית', direction: 'rtl' },
  ];

  private currentLanguageSubject = new BehaviorSubject<LanguageConfig>(
    this.languages[0]
  );
  currentLanguage$ = this.currentLanguageSubject.asObservable();

  private translations: { [lang: string]: any } = {};
  private translationsLoaded: { [lang: string]: boolean } = {};

  constructor(private http: HttpClient) {
    // Check if there's a saved language preference
    const savedLang = localStorage.getItem('preferredLanguage');
    if (savedLang) {
      const lang = this.languages.find((l) => l.code === savedLang);
      if (lang) {
        this.setLanguage(lang.code);
      }
    }
  }

  getLanguages(): LanguageConfig[] {
    return this.languages;
  }

  getCurrentLanguage(): LanguageConfig {
    return this.currentLanguageSubject.value;
  }

  setLanguage(languageCode: string): void {
    const language = this.languages.find((lang) => lang.code === languageCode);
    if (language) {
      // Load translations if not already loaded
      this.loadTranslations(languageCode).then(() => {
        // Update our subject
        this.currentLanguageSubject.next(language);

        // Save preference
        localStorage.setItem('preferredLanguage', languageCode);

        // Update document direction and language
        document.documentElement.dir = language.direction;
        document.documentElement.lang = language.code;

        // Add or remove RTL class from body for styling
        if (language.direction === 'rtl') {
          document.body.classList.add('rtl');
          console.log('Added RTL class to body');
        } else {
          document.body.classList.remove('rtl');
          console.log('Removed RTL class from body');
        }
      });
    }
  }

  getDirection(): 'ltr' | 'rtl' {
    return this.currentLanguageSubject.value.direction;
  }

  private loadTranslations(lang: string): Promise<void> {
    if (this.translationsLoaded[lang]) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.http.get(`/assets/i18n/${lang}.json`).subscribe(
        (data) => {
          this.translations[lang] = data;
          this.translationsLoaded[lang] = true;
          resolve();
        },
        (error) => {
          console.error(`Could not load translations for ${lang}`, error);
          resolve();
        }
      );
    });
  }

  translate(key: string, params?: { [key: string]: any }): string {
    const lang = this.currentLanguageSubject.value.code;

    if (!this.translations[lang]) {
      return key;
    }

    // Split the key by dots to navigate through nested objects
    const keys = key.split('.');
    let translation: any = this.translations[lang];

    // Navigate through the nested objects
    for (const k of keys) {
      if (translation[k] === undefined) {
        return key;
      }
      translation = translation[k];
    }

    if (typeof translation !== 'string') {
      return key;
    }

    // Replace parameters if provided
    if (params) {
      return this.interpolate(translation, params);
    }

    return translation;
  }

  private interpolate(text: string, params: { [key: string]: any }): string {
    return text.replace(/{{\s*([^}]+)\s*}}/g, (_, key) => {
      const value = params[key];
      return value !== undefined ? value : `{{${key}}}`;
    });
  }
}
