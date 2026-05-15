import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../auth/auth.service';
import { BasicQuestion, BasicQuestionAttempt } from '../questions/question.models';
import { QuestionService } from '../questions/question.service';

@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [FormsModule],
  template: `
    <section class="py-10">
      <div class="spartan-card p-8 md:p-10">
        <p class="text-sm font-bold uppercase tracking-[0.2em] text-indigo-600">Logged-in home</p>
        <h1 class="mt-3 text-4xl font-black text-slate-950 md:text-5xl">Good to see you, {{ auth.user()?.displayName || 'learner' }}.</h1>
        <p class="mt-4 max-w-2xl text-lg leading-8 text-slate-700">Create a one-answer recall question, then practice from the shared question list.</p>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section class="spartan-card p-6">
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Create</p>
          <h2 class="mt-2 text-2xl font-black text-slate-950">Add a basic question</h2>
          <form class="mt-5 space-y-4" (ngSubmit)="createQuestion()">
            <label class="block text-sm font-bold text-slate-700" for="question">Question</label>
            <textarea id="question" name="question" class="spartan-input min-h-28" [(ngModel)]="newQuestion" required maxlength="1000" placeholder="What does spaced repetition optimize for?"></textarea>

            <label class="block text-sm font-bold text-slate-700" for="answer">Answer</label>
            <input id="answer" name="answer" class="spartan-input" [(ngModel)]="newAnswer" required maxlength="1000" placeholder="Long-term retention" />

            @if (createMessage()) {
              <p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{{ createMessage() }}</p>
            }
            @if (errorMessage()) {
              <p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{{ errorMessage() }}</p>
            }

            <button type="submit" class="spartan-button spartan-button-primary w-full" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Create question' }}</button>
          </form>
        </section>

        <section class="spartan-card p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Practice</p>
              <h2 class="mt-2 text-2xl font-black text-slate-950">Solve basic questions</h2>
            </div>
            <button type="button" class="spartan-button spartan-button-secondary" (click)="loadQuestions()">Refresh</button>
          </div>

          @if (loading()) {
            <p class="mt-6 text-slate-600">Loading questions…</p>
          } @else if (questions().length === 0) {
            <p class="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-700">No questions yet. Create the first one to start practicing.</p>
          } @else {
            <div class="mt-6 space-y-4">
              @for (question of questions(); track question.id) {
                <article class="rounded-3xl border border-slate-200 bg-white p-5">
                  <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Question #{{ question.id }}</p>
                  <h3 class="mt-2 text-xl font-black text-slate-950">{{ question.question }}</h3>
                  <form class="mt-4 flex flex-col gap-3 sm:flex-row" (ngSubmit)="attemptQuestion(question)">
                    <input class="spartan-input" name="answer-{{ question.id }}" [(ngModel)]="answers[question.id]" required maxlength="1000" placeholder="Type your answer" />
                    <button type="submit" class="spartan-button spartan-button-primary shrink-0">Check</button>
                  </form>
                  @if (attempts()[question.id]; as attempt) {
                    <p class="mt-3 rounded-2xl px-4 py-3 text-sm font-bold" [class.bg-emerald-50]="attempt.correct" [class.text-emerald-800]="attempt.correct" [class.bg-amber-50]="!attempt.correct" [class.text-amber-800]="!attempt.correct">
                      {{ attempt.correct ? 'Correct — nice recall.' : 'Not quite. Try again from memory.' }}
                    </p>
                  }
                </article>
              }
            </div>
          }
        </section>
      </div>
    </section>
  `,
})
export class MemberHomeComponent implements OnInit {
  readonly questions = signal<BasicQuestion[]>([]);
  readonly attempts = signal<Record<number, BasicQuestionAttempt>>({});
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly createMessage = signal('');
  readonly errorMessage = signal('');

  newQuestion = '';
  newAnswer = '';
  answers: Record<number, string> = {};

  constructor(public readonly auth: AuthService, private readonly questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuestions();
  }

  loadQuestions(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.questionService.list().subscribe({
      next: (questions) => {
        this.questions.set(questions);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load questions. Please try again.');
        this.loading.set(false);
      },
    });
  }

  createQuestion(): void {
    if (!this.newQuestion.trim() || !this.newAnswer.trim()) {
      this.errorMessage.set('Question and answer are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.createMessage.set('');
    this.questionService.create(this.newQuestion, this.newAnswer).subscribe({
      next: (question) => {
        this.questions.update((questions) => [question, ...questions]);
        this.newQuestion = '';
        this.newAnswer = '';
        this.createMessage.set('Question created.');
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not create the question. Please try again.');
        this.saving.set(false);
      },
    });
  }

  attemptQuestion(question: BasicQuestion): void {
    const answer = this.answers[question.id]?.trim();
    if (!answer) {
      this.errorMessage.set('Type an answer before checking.');
      return;
    }

    this.errorMessage.set('');
    this.questionService.attempt(question.id, answer).subscribe({
      next: (attempt) => this.attempts.update((attempts) => ({ ...attempts, [question.id]: attempt })),
      error: () => this.errorMessage.set('Could not check your answer. Please try again.'),
    });
  }
}
