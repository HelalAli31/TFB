import {
  Directive,
  ElementRef,
  HostListener,
  Input,
  OnInit,
} from '@angular/core';

@Directive({
  selector: '[appFakeImage]',
})
export class FakeImageDirective implements OnInit {
  @Input() highlightColor: string;
  private element: ElementRef;
  constructor(_element: ElementRef) {
    this.element = _element;
  }

  ngOnInit(): void {
    console.log(this.highlightColor);
    this.element.nativeElement.style.color = this.highlightColor;
  }

  // @HostListener('hover') onMouseEnter() {
  //   this.element.nativeElement.style.color = 'red';
  // }
}
