import { Component, OnInit } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';
import { LanguageService } from 'src/app/serverServices/language.service';

@Component({
  selector: 'app-about-us',
  templateUrl: './about-us.component.html',
  styleUrls: ['./about-us.component.css'],
  animations: [
    trigger('fadeIn', [
      state('void', style({ opacity: 0, transform: 'translateY(20px)' })),
      transition(':enter', [
        animate(
          '0.6s ease-out',
          style({ opacity: 1, transform: 'translateY(0)' })
        ),
      ]),
    ]),
    trigger('slideIn', [
      state('void', style({ opacity: 0, transform: 'translateX(-30px)' })),
      transition(':enter', [
        animate(
          '0.7s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('slideInRight', [
      state('void', style({ opacity: 0, transform: 'translateX(30px)' })),
      transition(':enter', [
        animate(
          '0.7s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
    trigger('testimonialSlide', [
      transition('* => *', [
        style({ opacity: 0, transform: 'translateX(50px)' }),
        animate(
          '0.5s ease-out',
          style({ opacity: 1, transform: 'translateX(0)' })
        ),
      ]),
    ]),
  ],
})
export class AboutUsComponent implements OnInit {
  currentTestimonialIndex = 0;
  testimonials = [
    {
      quote: 'about.testimonials.quote1',
      name: 'Alex M.',
      rating: 5,
    },
    {
      quote: 'about.testimonials.quote2',
      name: 'Jamie T.',
      rating: 5,
    },
  ];

  offerItems = [
    {
      icon: 'box-open',
      title: 'about.whatWeOffer.products.title',
      description: 'about.whatWeOffer.products.description',
    },
    {
      icon: 'award',
      title: 'about.whatWeOffer.brands.title',
      description: 'about.whatWeOffer.brands.description',
    },
    {
      icon: 'tags',
      title: 'about.whatWeOffer.prices.title',
      description: 'about.whatWeOffer.prices.description',
    },
    {
      icon: 'shipping-fast',
      title: 'about.whatWeOffer.shipping.title',
      description: 'about.whatWeOffer.shipping.description',
    },
    {
      icon: 'headset',
      title: 'about.whatWeOffer.support.title',
      description: 'about.whatWeOffer.support.description',
    },
    {
      icon: 'shield-alt',
      title: 'about.whatWeOffer.safety.title',
      description: 'about.whatWeOffer.safety.description',
    },
  ];

  teamMembers = [
    {
      name: 'John Davis',
      position: 'about.team.founder',
      bio: 'about.team.founderBio',
      image: 'assets/homepage.jpg',
    },
    {
      name: 'Sarah Johnson',
      position: 'about.team.specialist',
      bio: 'about.team.specialistBio',
      image: 'assets/homepage.jpg',
    },
    {
      name: 'Michael Chen',
      position: 'about.team.experience',
      bio: 'about.team.experienceBio',
      image: 'assets/homepage.jpg',
    },
  ];

  missionValues = [
    {
      icon: 'bullseye',
      title: 'about.missionValues.mission.title',
      description: 'about.missionValues.mission.description',
    },
    {
      icon: 'gem',
      title: 'about.missionValues.values.title',
      description: 'about.missionValues.values.description',
    },
    {
      icon: 'handshake',
      title: 'about.missionValues.promise.title',
      description: 'about.missionValues.promise.description',
    },
  ];

  constructor(public languageService: LanguageService) {}

  ngOnInit(): void {
    // Auto-rotate testimonials every 5 seconds
    setInterval(() => {
      this.nextTestimonial();
    }, 5000);
  }

  nextTestimonial(): void {
    this.currentTestimonialIndex =
      (this.currentTestimonialIndex + 1) % this.testimonials.length;
  }

  prevTestimonial(): void {
    this.currentTestimonialIndex =
      (this.currentTestimonialIndex - 1 + this.testimonials.length) %
      this.testimonials.length;
  }

  getStarsArray(count: number): number[] {
    return Array(count)
      .fill(0)
      .map((_, i) => i);
  }
}
