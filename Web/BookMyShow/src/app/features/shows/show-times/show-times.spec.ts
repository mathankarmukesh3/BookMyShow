import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ShowTimes } from './show-times';

describe('ShowTimes', () => {
  let component: ShowTimes;
  let fixture: ComponentFixture<ShowTimes>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ShowTimes],
    }).compileComponents();

    fixture = TestBed.createComponent(ShowTimes);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
