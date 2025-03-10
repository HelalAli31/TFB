import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuantityDialogComponent } from './quantity-dialog.component';

describe('QuantityDialogComponent', () => {
  let component: QuantityDialogComponent;
  let fixture: ComponentFixture<QuantityDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ QuantityDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(QuantityDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
