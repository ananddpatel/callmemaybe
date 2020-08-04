import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisteredNumbersComponent } from './registered-numbers.component';

describe('RegisteredNumbersComponent', () => {
  let component: RegisteredNumbersComponent;
  let fixture: ComponentFixture<RegisteredNumbersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisteredNumbersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisteredNumbersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
