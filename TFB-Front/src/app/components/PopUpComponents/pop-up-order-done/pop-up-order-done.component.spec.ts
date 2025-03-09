import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpOrderDoneComponent } from './pop-up-order-done.component';

describe('PopUpOrderDoneComponent', () => {
  let component: PopUpOrderDoneComponent;
  let fixture: ComponentFixture<PopUpOrderDoneComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpOrderDoneComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpOrderDoneComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
