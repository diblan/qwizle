import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { RUNTIME_CONFIG } from '../config/runtime-config';
import { AuthService } from './auth.service';

const apiBaseUrl = 'https://api.example.test/api';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: RUNTIME_CONFIG, useValue: { apiBaseUrl } },
      ],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('logs in and stores token plus user profile', () => {
    service.login('learner@qwizle.test', 'qwizle123').subscribe((user) => {
      expect(user.displayName).toBe('Demo Learner');
      expect(service.user()?.email).toBe('learner@qwizle.test');
      expect(localStorage.getItem('qwizle.auth.token')).toBe('demo-token');
    });

    const request = http.expectOne(`${apiBaseUrl}/auth/login`);
    expect(request.request.method).toBe('POST');
    request.flush({
      token: 'demo-token',
      user: { id: 1, email: 'learner@qwizle.test', displayName: 'Demo Learner' },
    });
  });

  it('restores a session from the current-user endpoint', () => {
    localStorage.setItem('qwizle.auth.token', 'demo-token');

    service.restoreSession().subscribe((user) => {
      expect(user?.displayName).toBe('Demo Learner');
      expect(service.user()?.displayName).toBe('Demo Learner');
    });

    const request = http.expectOne(`${apiBaseUrl}/auth/me`);
    expect(request.request.method).toBe('GET');
    request.flush({ id: 1, email: 'learner@qwizle.test', displayName: 'Demo Learner' });
  });
});
