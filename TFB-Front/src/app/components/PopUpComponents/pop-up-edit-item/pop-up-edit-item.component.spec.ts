import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PopUpEditItemComponent } from './pop-up-edit-item.component';

describe('PopUpEditItemComponent', () => {
  let component: PopUpEditItemComponent;
  let fixture: ComponentFixture<PopUpEditItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PopUpEditItemComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PopUpEditItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
