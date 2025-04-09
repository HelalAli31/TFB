import { Component, OnInit } from '@angular/core';
import { LanguageService } from 'src/app/serverServices/language.service';
import { UserService } from 'src/app/serverServices/user/user.service';

@Component({
  selector: 'app-contact-home',
  templateUrl: './contact-home.component.html',
  styleUrls: ['./contact-home.component.css'],
})
export class ContactHomeComponent implements OnInit {
  name: string = '';
  email: string = '';
  message: string = '';

  constructor(
    public languageService: LanguageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    if (this.languageService.getDirection() === 'rtl') {
      document.body.classList.add('rtl');
    }
  }

  onSubmit(): void {
    const formData = {
      name: this.name,
      email: this.email,
      message: this.message,
    };

    this.userService
      .sendContactMessage(formData.name, formData.email, formData.message)
      .then((res) => {
        if (res && res.success) {
          alert('✅ Message sent successfully!');
          this.name = '';
          this.email = '';
          this.message = '';
        } else {
          alert('❌ Failed to send message. Please try again.');
        }
      })
      .catch((err) => {
        console.error('Email send error:', err);
        alert('❌ Error sending message. Try again later.');
      });
  }
}
