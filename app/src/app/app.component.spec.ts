import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';

import { AuthService } from './auth/auth.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let fixture: ComponentFixture<AppComponent>;
  let auth: jasmine.SpyObj<AuthService>;

  beforeEach(async () => {
    auth = jasmine.createSpyObj<AuthService>('AuthService', ['restoreSession', 'clearSession']);
    auth.restoreSession.and.returnValue(of(null));

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AppComponent);
    fixture.detectChanges();
  });

  it('renders the router shell and restores an existing session', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.querySelector('.app-shell')).not.toBeNull();
    expect(auth.restoreSession).toHaveBeenCalled();
  });
});
