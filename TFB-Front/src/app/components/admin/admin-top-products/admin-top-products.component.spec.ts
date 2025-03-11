import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTopProductsComponent } from './admin-top-products.component';

describe('AdminTopProductsComponent', () => {
  let component: AdminTopProductsComponent;
  let fixture: ComponentFixture<AdminTopProductsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AdminTopProductsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTopProductsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
