import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/serverServices/language.service';

@Component({
  selector: 'app-contact-home',
  templateUrl: './contact-home.component.html',
  styleUrls: ['./contact-home.component.css'],
})
export class ContactHomeComponent implements OnInit {
  constructor(public languageService: LanguageService) {}

  ngOnInit(): void {
    console.log('Body has RTL class:', document.body.classList.contains('rtl'));

    // For testing - manually add RTL class if Hebrew is selected
    if (this.languageService.getDirection() === 'rtl') {
      document.body.classList.add('rtl');
      console.log('Manually added RTL class to body');
    }
  }
}
