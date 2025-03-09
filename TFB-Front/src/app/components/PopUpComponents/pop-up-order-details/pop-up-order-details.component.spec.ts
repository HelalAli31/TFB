import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpOrderDetailsComponent } from './pop-up-order-details.component';

describe('PopUpOrderDetailsComponent', () => {
  let component: PopUpOrderDetailsComponent;
  let fixture: ComponentFixture<PopUpOrderDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpOrderDetailsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpOrderDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
