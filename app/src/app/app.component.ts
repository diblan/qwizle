import { Component } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterLink, RouterOutlet],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
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
