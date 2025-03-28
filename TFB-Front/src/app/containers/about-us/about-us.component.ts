import { Component, OnInit } from '@angular/core';
import {
  trigger,
  transition,
  style,
  animate,
  state,
} from '@angular/animations';

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
      quote:
        "The Fog Bank has the best selection of products I've found anywhere. Their staff is knowledgeable and always helpful!",
      name: 'Alex M.',
      rating: 5,
    },
    {
      quote:
        "I've been shopping here for years and have never been disappointed. Quality products and excellent service every time.",
      name: 'Jamie T.',
      rating: 5,
    },
  ];

  offerItems = [
    {
      icon: 'box-open',
      title: 'Premium Selection',
      description:
        'A wide range of high-quality vape products carefully selected for our customers',
    },
    {
      icon: 'award',
      title: 'Top Brands',
      description:
        'Partnerships with leading brands known for reliability and performance',
    },
    {
      icon: 'tags',
      title: 'Competitive Pricing',
      description:
        'Great value with exclusive deals and promotions for our loyal customers',
    },
    {
      icon: 'shipping-fast',
      title: 'Fast Shipping',
      description:
        'Secure and efficient delivery to ensure your products arrive safely',
    },
    {
      icon: 'headset',
      title: 'Expert Support',
      description:
        'Dedicated customer service team ready to assist with any questions',
    },
    {
      icon: 'shield-alt',
      title: 'Safety First',
      description: 'All products tested and compliant with safety regulations',
    },
  ];

  teamMembers = [
    {
      name: 'John Davis',
      position: 'Founder & CEO',
      bio: 'With over 10 years in the industry, John brings expertise and vision to The Fog Bank.',
      image: 'assets/homepage.jpg',
    },
    {
      name: 'Sarah Johnson',
      position: 'Product Specialist',
      bio: 'Sarah ensures we stock only the highest quality products that meet our strict standards.',
      image: 'assets/homepage.jpg',
    },
    {
      name: 'Michael Chen',
      position: 'Customer Experience',
      bio: 'Michael is dedicated to making your shopping experience exceptional from start to finish.',
      image: 'assets/homepage.jpg',
    },
  ];

  missionValues = [
    {
      icon: 'bullseye',
      title: 'Our Mission',
      description:
        'To provide high-quality vaping products that meet the highest safety and innovation standards while creating an exceptional experience for our customers.',
    },
    {
      icon: 'gem',
      title: 'Our Values',
      description:
        'Quality, integrity, customer satisfaction, and continuous improvement guide everything we do at The Fog Bank.',
    },
    {
      icon: 'handshake',
      title: 'Our Promise',
      description:
        'We promise to deliver only the best products, exceptional service, and a shopping experience that exceeds your expectations.',
    },
  ];

  constructor() {}

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
