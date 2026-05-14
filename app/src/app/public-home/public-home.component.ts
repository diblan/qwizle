import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-public-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <section class="grid items-center gap-10 py-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div>
        <p class="mb-4 inline-flex rounded-full bg-indigo-100 px-4 py-2 text-sm font-bold text-indigo-700">Daily learning, built for retention</p>
        <h1 class="max-w-3xl text-5xl font-black tracking-tight text-slate-950 md:text-7xl">Make every day a tiny win for your brain.</h1>
        <p class="mt-6 max-w-2xl text-lg leading-8 text-slate-700">Qwizle turns focused learning into a simple daily rhythm: answer a small challenge, reinforce what matters, and come back tomorrow sharper.</p>
        <div class="mt-8 flex flex-wrap gap-3">
          <a routerLink="/login" class="spartan-button spartan-button-primary">Try the demo login</a>
          <a routerLink="/home" class="spartan-button spartan-button-secondary">View today's challenge</a>
        </div>
      </div>
      <div class="spartan-card p-6">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Today preview</p>
        <h2 class="mt-4 text-3xl font-black text-slate-950">Recall sprint</h2>
        <p class="mt-3 text-slate-600">A warm-up card, a concept check, and one reflection prompt keep the first version intentionally small.</p>
        <div class="mt-6 grid gap-3">
          <div class="rounded-2xl bg-slate-50 p-4"><strong>1.</strong> Read the prompt.</div>
          <div class="rounded-2xl bg-slate-50 p-4"><strong>2.</strong> Answer without notes.</div>
          <div class="rounded-2xl bg-slate-50 p-4"><strong>3.</strong> Review the explanation.</div>
        </div>
      </div>
    </section>
  `,
})
export class PublicHomeComponent {}
