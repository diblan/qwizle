import { Component } from '@angular/core';

import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-member-home',
  standalone: true,
  template: `
    <section class="py-10">
      <div class="spartan-card p-8 md:p-10">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Logged-in home</p>
        <h1 class="mt-3 text-4xl font-black text-slate-950 md:text-5xl">Good to see you, {{ auth.user()?.displayName || 'learner' }}.</h1>
        <p class="mt-4 max-w-2xl text-lg leading-8 text-slate-700">Your first daily challenge is ready. Today is intentionally lightweight while Qwizle's foundation takes shape.</p>

        <div class="mt-8 grid gap-4 md:grid-cols-3">
          <article class="rounded-3xl bg-indigo-50 p-5">
            <p class="font-black text-indigo-900">Warm up</p>
            <p class="mt-2 text-sm text-indigo-800">Name one thing you learned yesterday.</p>
          </article>
          <article class="rounded-3xl bg-emerald-50 p-5">
            <p class="font-black text-emerald-900">Recall</p>
            <p class="mt-2 text-sm text-emerald-800">Answer from memory before checking notes.</p>
          </article>
          <article class="rounded-3xl bg-amber-50 p-5">
            <p class="font-black text-amber-900">Reflect</p>
            <p class="mt-2 text-sm text-amber-800">Write a one-sentence takeaway.</p>
          </article>
        </div>
      </div>
    </section>
  `,
})
export class MemberHomeComponent {
  constructor(public readonly auth: AuthService) {}
}
