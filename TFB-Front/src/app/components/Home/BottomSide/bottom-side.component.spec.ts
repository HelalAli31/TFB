import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BottomSideComponent } from './bottom-side.component';

describe('BottomSideComponent', () => {
  let component: BottomSideComponent;
  let fixture: ComponentFixture<BottomSideComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ BottomSideComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BottomSideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
