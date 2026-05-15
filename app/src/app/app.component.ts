import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  template: `
    <div class="min-h-screen bg-[radial-gradient(circle_at_top_left,#e0e7ff,transparent_32rem),linear-gradient(135deg,#f8fafc,#eef2ff)]">
      @if (!isLoginPage()) {
        <header class="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <a routerLink="/" class="text-2xl font-black tracking-tight text-slate-950">Qwizle</a>
          <nav class="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <a routerLink="/" class="hover:text-indigo-700">Home</a>
            @if (auth.user(); as user) {
              <a routerLink="/home" class="hover:text-indigo-700">{{ user.displayName }}</a>
              <button type="button" class="spartan-button spartan-button-secondary" (click)="auth.logout()">Log out</button>
            } @else {
              <a routerLink="/login" class="spartan-button spartan-button-primary">Log in</a>
            }
          </nav>
        </header>
      }
      <main [class]="isLoginPage() ? 'mx-auto max-w-6xl pb-10' : 'mx-auto max-w-6xl px-6 pb-16'">
        <router-outlet />
      </main>
    </div>
  `,
})
export class AppComponent {
  constructor(
    public readonly auth: AuthService,
    private readonly router: Router,
  ) {
    this.auth.restoreSession().subscribe({ error: () => this.auth.clearSession() });
  }

  isLoginPage(): boolean {
    return this.router.url.split('?')[0].split('#')[0] === '/login';
  }
}
