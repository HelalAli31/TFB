import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { interval, Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';
import { CategoryService } from 'src/app/serverServices/categoryService/category.service';
import getIsAdmin from 'src/app/serverServices/Payload/isAdmin';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
  slides: string[] = [];
  currentSlideIndex = 0;
  isLoading = true;
  private autoSlideSubscription: Subscription | null = null;
  previewImage: string | null = null;
  selectedImage: File | null = null;
  selectedSlideName: string = 'slide1.jpg';
  public isAdmin: any;

  constructor(
    private http: HttpClient,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.slides = [
      `${environment.apiUrl}/assets/sliders/slide1.jpg`,
      `${environment.apiUrl}/assets/sliders/slide2.jpg`,
      `${environment.apiUrl}/assets/sliders/slide3.jpg`,
      `${environment.apiUrl}/assets/sliders/slide4.jpg`,
    ];
    this.startAutoSlide();
    this.isAdmin = getIsAdmin();
  }

  startAutoSlide(): void {
    interval(7000)
      .pipe(startWith(0))
      .subscribe(() => {
        this.nextSlide();
      });
  }

  prevSlide(): void {
    this.currentSlideIndex =
      (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
  }

  nextSlide(): void {
    this.currentSlideIndex = (this.currentSlideIndex + 1) % this.slides.length;
  }

  goToSlide(index: number): void {
    this.currentSlideIndex = index;
  }

  getCurrentSlideUrl(): string {
    return this.slides[this.currentSlideIndex] || '/assets/homepage.jpg';
  }
  uploadSliderImage(): void {
    if (!this.selectedImage || !this.selectedSlideName) return;

    this.categoryService
      .updateSliders(this.selectedSlideName, this.selectedImage)
      .subscribe({
        next: () => {
          alert('✅Slider updated successfully!');
          this.previewImage = null;
          this.selectedImage = null;

          // Force reload slide
          const index =
            parseInt(
              this.selectedSlideName.replace('slide', '').replace('.jpg', '')
            ) - 1;
          this.slides[index] = `${environment.apiUrl}/assets/sliders/${
            this.selectedSlideName
          }?t=${Date.now()}`;
        },
        error: (err) => {
          console.error('Upload error:', err);
          alert('Failed to update slider image.');
        },
      });
  }

  async onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedImage = file;
      this.previewImage = await this.convertFileToBase64(file);
    }
  }
  convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  }
}
