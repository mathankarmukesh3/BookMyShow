import { TestBed } from '@angular/core/testing';

import { Show } from './show';

describe('Show', () => {
  let service: Show;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Show);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
