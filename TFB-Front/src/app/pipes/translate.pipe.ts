import { Pipe, PipeTransform } from '@angular/core';
import { LanguageService } from '../serverServices/language.service';

@Pipe({
  name: 'translate',
  pure: false,
})
export class TranslatePipe implements PipeTransform {
  constructor(private languageService: LanguageService) {}

  transform(key: string, params?: { [key: string]: any }): string {
    if (!this.languageService || !this.languageService.translate) {
      console.error('Language service or translate method not available');
      return key;
    }
    return this.languageService.translate(key, params);
  }
}
