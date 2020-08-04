import { TestBed } from '@angular/core/testing';

import { AlreadyLoggedinGuard } from './already-loggedin.guard';

describe('AlreadyLoggedinGuard', () => {
  let guard: AlreadyLoggedinGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(AlreadyLoggedinGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
