import { Component, OnInit } from '@angular/core';
import { environment } from '../../../../environments/environment'; // Import environment
import { LanguageService } from 'src/app/serverServices/language.service';

@Component({
  selector: 'app-section1',
  templateUrl: './section1.component.html',
  styleUrls: ['./section1.component.css'],
})
export class Section1Component implements OnInit {
  apiUrl = environment.apiUrl; // ✅ Set API base URL from environment

  constructor(public languageService: LanguageService) {}

  ngOnInit(): void {}
}
