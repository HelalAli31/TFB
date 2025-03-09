import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpDeleteItemComponent } from './pop-up-delete-item.component';

describe('PopUpDeleteItemComponent', () => {
  let component: PopUpDeleteItemComponent;
  let fixture: ComponentFixture<PopUpDeleteItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpDeleteItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpDeleteItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
