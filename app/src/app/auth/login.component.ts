import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { BrnButton } from '@spartan-ng/brain/button';
import { BrnField } from '@spartan-ng/brain/field';
import { BrnInput } from '@spartan-ng/brain/input';
import { BrnLabel } from '@spartan-ng/brain/label';

import { AuthService } from './auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [BrnButton, BrnField, BrnInput, BrnLabel, ReactiveFormsModule, RouterLink],
  template: `
    <section class="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-8 px-4 py-8 sm:px-6 md:grid-cols-[0.95fr_1.05fr] md:py-12 lg:px-8">
      <div class="order-2 rounded-3xl border border-slate-200/80 bg-white/70 p-6 shadow-sm backdrop-blur md:order-1 md:p-8 lg:p-10">
        <a routerLink="/" class="inline-flex items-center gap-2 text-base font-black tracking-tight text-slate-950" aria-label="Qwizle public home">
          <span class="flex size-9 items-center justify-center rounded-2xl bg-indigo-600 text-sm font-black text-white shadow-lg shadow-indigo-600/20">Q</span>
          Qwizle
        </a>
        <p class="mt-10 inline-flex rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-indigo-700">Daily recall routine</p>
        <h1 class="mt-4 max-w-xl text-4xl font-black tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">Welcome back to your brain-sharpening streak.</h1>
        <p class="mt-5 max-w-lg text-base leading-7 text-slate-600 sm:text-lg">Sign in to continue today’s focused learning challenge and keep the experience intentionally simple.</p>
        <dl class="mt-8 grid gap-3 text-sm text-slate-700 sm:grid-cols-3 md:grid-cols-1 lg:grid-cols-3">
          <div class="rounded-2xl bg-slate-50 p-4">
            <dt class="font-bold text-slate-950">Short</dt>
            <dd class="mt-1">Designed for daily completion.</dd>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <dt class="font-bold text-slate-950">Focused</dt>
            <dd class="mt-1">One clear learning path at a time.</dd>
          </div>
          <div class="rounded-2xl bg-slate-50 p-4">
            <dt class="font-bold text-slate-950">Demo-ready</dt>
            <dd class="mt-1">Use the included learner account.</dd>
          </div>
        </dl>
      </div>

      <div class="order-1 md:order-2">
        <div class="mx-auto w-full max-w-md rounded-3xl border border-slate-200 bg-white p-6 shadow-2xl shadow-slate-200/80 sm:p-8 lg:p-10">
          <div class="text-center sm:text-left">
            <p class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Secure demo login</p>
            <h2 class="mt-3 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl">Log in to Qwizle</h2>
            <p class="mt-3 text-sm leading-6 text-slate-600">Use the demo learner to reach the logged-in daily challenge.</p>
          </div>

          <form class="mt-8 space-y-6" [formGroup]="form" (ngSubmit)="submit()" aria-describedby="login-help login-error">
            <div brnField class="space-y-2">
              <label brnLabel for="email" class="text-sm font-semibold text-slate-900">Email address</label>
              <input
                brnInput
                id="email"
                class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100"
                type="email"
                formControlName="email"
                autocomplete="email"
                inputmode="email"
                aria-describedby="email-help email-error"
              />
              <p id="email-help" class="text-sm text-slate-500">Enter the email for your learner account.</p>
              <p id="email-error" class="min-h-5 text-sm font-medium text-red-700" aria-live="polite">
                @if (showEmailError()) {
                  @if (form.controls.email.hasError('required')) {
                    Email is required.
                  } @else if (form.controls.email.hasError('email')) {
                    Enter a valid email address.
                  }
                }
              </p>
            </div>

            <div brnField class="space-y-2">
              <label brnLabel for="password" class="text-sm font-semibold text-slate-900">Password</label>
              <input
                brnInput
                id="password"
                class="h-12 w-full rounded-2xl border border-slate-300 bg-white px-4 text-base text-slate-950 shadow-sm transition placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-100 aria-[invalid=true]:border-red-500 aria-[invalid=true]:focus:ring-red-100"
                type="password"
                formControlName="password"
                autocomplete="current-password"
                aria-describedby="password-help password-error"
              />
              <p id="password-help" class="text-sm text-slate-500">Use the demo password shown below.</p>
              <p id="password-error" class="min-h-5 text-sm font-medium text-red-700" aria-live="polite">
                @if (showPasswordError()) {
                  Password is required.
                }
              </p>
            </div>

            <div id="login-error" class="min-h-14" aria-live="assertive">
              @if (error()) {
                <p class="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700">{{ error() }}</p>
              }
            </div>

            <div class="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
              <button
                brnButton
                class="inline-flex h-12 w-full items-center justify-center rounded-full bg-indigo-600 px-6 text-sm font-bold text-white shadow-lg shadow-indigo-600/25 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:text-slate-500 disabled:shadow-none sm:w-auto"
                type="submit"
                [disabled]="form.invalid || loading()"
              >
                {{ loading() ? 'Signing in…' : 'Sign in' }}
              </button>
              <a
                brnButton
                routerLink="/"
                class="inline-flex h-12 w-full items-center justify-center rounded-full border border-slate-300 bg-white px-6 text-sm font-bold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-slate-200 sm:w-auto"
              >
                Back home
              </a>
            </div>
          </form>

          <p id="login-help" class="mt-6 rounded-2xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
            Demo credentials:
            <strong class="font-bold text-slate-950">learner&#64;qwizle.test</strong>
            <span aria-hidden="true"> / </span>
            <span class="sr-only">and password</span>
            <strong class="font-bold text-slate-950">qwizle123</strong>
          </p>
        </div>
      </div>
    </section>
  `,
})
export class LoginComponent {
  private readonly formBuilder = inject(FormBuilder);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['learner@qwizle.test', [Validators.required, Validators.email]],
    password: ['qwizle123', [Validators.required]],
  });

  constructor(
    private readonly auth: AuthService,
    private readonly router: Router,
  ) {}

  showEmailError(): boolean {
    const control = this.form.controls.email;
    return control.invalid && (control.dirty || control.touched);
  }

  showPasswordError(): boolean {
    const control = this.form.controls.password;
    return control.invalid && (control.dirty || control.touched);
  }

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
