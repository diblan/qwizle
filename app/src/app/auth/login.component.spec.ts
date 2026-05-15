import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let fixture: ComponentFixture<LoginComponent>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['login'], { user: () => null });
    auth.login.and.returnValue(of({ id: 1, email: 'learner@qwizle.test', displayName: 'Demo Learner' }));

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    fixture.detectChanges();
  });

  it('renders an accessible polished login form and submits the login form', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('learner@qwizle.test');
    expect(compiled.querySelector('label[for="email"]')?.textContent).toContain('Email address');
    expect(compiled.querySelector('input#email')?.getAttribute('aria-describedby')).toContain('email-error');
    expect(compiled.querySelector('label[for="password"]')?.textContent).toContain('Password');
    expect(compiled.querySelector('input#password')?.getAttribute('aria-describedby')).toContain('password-error');
    expect(Array.from(compiled.querySelectorAll('a')).some((link) => link.textContent?.includes('Back home'))).toBeTrue();

    fixture.componentInstance.submit();

    expect(auth.login).toHaveBeenCalledWith('learner@qwizle.test', 'qwizle123');
  });
});
