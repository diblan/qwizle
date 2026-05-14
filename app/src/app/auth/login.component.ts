import { Component, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto max-w-xl py-12">
      <div class="spartan-card p-8">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Welcome back</p>
        <h1 class="mt-3 text-4xl font-black text-slate-950">Log in to Qwizle</h1>
        <p class="mt-3 text-slate-600">Use the demo learner to reach the first logged-in homepage.</p>

        <form class="mt-8 grid gap-5" [formGroup]="form" (ngSubmit)="submit()">
          <label class="grid gap-2 font-semibold text-slate-800">
            Email
            <input class="spartan-input" type="email" formControlName="email" autocomplete="email" />
          </label>
          <label class="grid gap-2 font-semibold text-slate-800">
            Password
            <input class="spartan-input" type="password" formControlName="password" autocomplete="current-password" />
          </label>
          @if (error()) {
            <p class="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-700">{{ error() }}</p>
          }
          <button class="spartan-button spartan-button-primary" type="submit" [disabled]="form.invalid || loading()">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </button>
        </form>

        <p class="mt-6 text-sm text-slate-600">Demo credentials: <strong>learner&#64;qwizle.test</strong> / <strong>qwizle123</strong></p>
        <a routerLink="/" class="mt-4 inline-block text-sm font-bold text-indigo-700">Back to public home</a>
      </div>
    </section>
  `,
})
export class LoginComponent {
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['learner@qwizle.test', [Validators.required, Validators.email]],
    password: ['qwizle123', [Validators.required]],
  });

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  submit(): void {
    if (this.form.invalid) {
      return;
    }

    this.loading.set(true);
    this.error.set(null);
    const { email, password } = this.form.getRawValue();
    this.auth.login(email, password).subscribe({
      next: () => void this.router.navigateByUrl('/home'),
      error: () => {
        this.loading.set(false);
        this.error.set('Invalid email or password.');
      },
    });
  }
}
