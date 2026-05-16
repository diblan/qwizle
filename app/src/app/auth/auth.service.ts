import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { apiUrl, RUNTIME_CONFIG, RuntimeConfig } from '../config/runtime-config';
import { LoginResponse, UserProfile } from './auth.models';

const TOKEN_KEY = 'qwizle.auth.token';
const USER_KEY = 'qwizle.auth.user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  readonly user = signal<UserProfile | null>(this.readStoredUser());

  constructor(
    private readonly http: HttpClient,
    private readonly router: Router,
    @Inject(RUNTIME_CONFIG) private readonly config: RuntimeConfig,
  ) {}

  login(email: string, password: string): Observable<UserProfile> {
    return this.http.post<LoginResponse>(apiUrl(this.config, '/auth/login'), { email, password }).pipe(
      tap((response) => this.storeSession(response.token, response.user)),
      map((response) => response.user),
    );
  }

  restoreSession(): Observable<UserProfile | null> {
    if (!this.token()) {
      return of(null);
    }

    return this.http.get<UserProfile>(apiUrl(this.config, '/auth/me')).pipe(
      tap((user) => this.storeUser(user)),
      catchError(() => {
        this.clearSession();
        return of(null);
      }),
    );
  }

  token(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  logout(): void {
    this.clearSession();
    void this.router.navigateByUrl('/');
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.user.set(null);
  }

  private storeSession(token: string, user: UserProfile): void {
    localStorage.setItem(TOKEN_KEY, token);
    this.storeUser(user);
  }

  private storeUser(user: UserProfile): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    this.user.set(user);
  }

  private readStoredUser(): UserProfile | null {
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) {
      return null;
    }
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      localStorage.removeItem(USER_KEY);
      return null;
    }
  }
}
