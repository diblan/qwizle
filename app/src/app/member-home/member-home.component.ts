import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../auth/auth.service';
import { BasicQuestion, BasicQuestionAttempt, QuestionType, Quiz } from '../questions/question.models';
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
        <p class="mt-4 max-w-2xl text-lg leading-8 text-slate-700">Create recall questions, group them into quizzes, then practice from the shared question list.</p>
      </div>

      <div class="mt-8 grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section class="space-y-6">
          <div class="spartan-card p-6">
          <p class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Create</p>
          <h2 class="mt-2 text-2xl font-black text-slate-950">Add a question</h2>
          <form class="mt-5 space-y-4" (ngSubmit)="createQuestion()">
            <label class="block text-sm font-bold text-slate-700" for="questionType">Question type</label>
            <select id="questionType" name="questionType" class="spartan-input" [(ngModel)]="newQuestionType">
              <option value="SINGLE_ANSWER">One answer</option>
              <option value="SET_ANSWER">Fixed-size answer set</option>
            </select>

            <label class="block text-sm font-bold text-slate-700" for="question">Question</label>
            <textarea id="question" name="question" class="spartan-input min-h-28" [(ngModel)]="newQuestion" required maxlength="1000" placeholder="Name the layers of the OSI model."></textarea>

            @if (newQuestionType === 'SINGLE_ANSWER') {
              <label class="block text-sm font-bold text-slate-700" for="answer">Answer</label>
              <input id="answer" name="answer" class="spartan-input" [(ngModel)]="newAnswer" required maxlength="1000" placeholder="Long-term retention" />
            } @else {
              <label class="block text-sm font-bold text-slate-700" for="setAnswers">Accepted answers</label>
              <textarea id="setAnswers" name="setAnswers" class="spartan-input min-h-36" [(ngModel)]="newSetAnswers" required maxlength="7000" placeholder="Physical&#10;Data Link&#10;Network&#10;Transport&#10;Session&#10;Presentation&#10;Application"></textarea>
              <p class="text-sm font-semibold text-slate-600">Enter one accepted answer per line. Learners must provide exactly this many answers, in any order.</p>
            }

            @if (createMessage()) {
              <p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{{ createMessage() }}</p>
            }
            @if (errorMessage()) {
              <p class="rounded-2xl bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-800">{{ errorMessage() }}</p>
            }

            <button type="submit" class="spartan-button spartan-button-primary w-full" [disabled]="saving()">{{ saving() ? 'Saving…' : 'Create question' }}</button>
          </form>
          </div>

          <div class="spartan-card p-6">
            <p class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Quiz builder</p>
            <h2 class="mt-2 text-2xl font-black text-slate-950">Make a set of questions</h2>
            <p class="mt-2 text-sm font-semibold text-slate-600">Choose two or more existing questions to package as a quiz, such as an OSI model review.</p>
            <form class="mt-5 space-y-4" (ngSubmit)="createQuiz()">
              <label class="block text-sm font-bold text-slate-700" for="quizTitle">Quiz title</label>
              <input id="quizTitle" name="quizTitle" class="spartan-input" [(ngModel)]="newQuizTitle" required maxlength="160" placeholder="OSI model basics" />

              <label class="block text-sm font-bold text-slate-700" for="quizDescription">Description</label>
              <textarea id="quizDescription" name="quizDescription" class="spartan-input min-h-24" [(ngModel)]="newQuizDescription" maxlength="1000" placeholder="TCP placement and all seven layers."></textarea>

              @if (questions().length < 2) {
                <p class="rounded-2xl bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">Create at least two questions before making a quiz.</p>
              } @else {
                <fieldset class="space-y-2">
                  <legend class="text-sm font-bold text-slate-700">Questions in this quiz</legend>
                  @for (question of questions(); track question.id) {
                    <label class="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3 text-sm font-semibold text-slate-700">
                      <input type="checkbox" class="mt-1" name="quiz-question-{{ question.id }}" [(ngModel)]="selectedQuizQuestionIds[question.id]" />
                      <span>{{ question.question }} <span class="text-slate-500">({{ question.type === 'SET_ANSWER' ? question.solutionCount + ' answers' : 'one answer' }})</span></span>
                    </label>
                  }
                </fieldset>
              }

              @if (quizMessage()) {
                <p class="rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-800">{{ quizMessage() }}</p>
              }

              <button type="submit" class="spartan-button spartan-button-primary w-full" [disabled]="savingQuiz() || questions().length < 2">{{ savingQuiz() ? 'Saving quiz…' : 'Create quiz' }}</button>
            </form>
          </div>
        </section>

        <section class="spartan-card p-6">
          <div class="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p class="text-sm font-bold uppercase tracking-[0.18em] text-indigo-600">Practice</p>
              <h2 class="mt-2 text-2xl font-black text-slate-950">Solve questions</h2>
            </div>
            <button type="button" class="spartan-button spartan-button-secondary" (click)="loadQuestions()">Refresh</button>
          </div>

          @if (quizzes().length > 0) {
            <div class="mt-6 rounded-3xl bg-indigo-50 p-5">
              <p class="text-sm font-bold uppercase tracking-[0.16em] text-indigo-700">Quizzes</p>
              <div class="mt-3 space-y-3">
                @for (quiz of quizzes(); track quiz.id) {
                  <article class="rounded-2xl bg-white p-4">
                    <h3 class="text-lg font-black text-slate-950">{{ quiz.title }}</h3>
                    @if (quiz.description) {
                      <p class="mt-1 text-sm font-semibold text-slate-600">{{ quiz.description }}</p>
                    }
                    <p class="mt-2 text-xs font-bold uppercase tracking-[0.14em] text-slate-500">{{ quiz.questionCount }} questions</p>
                    <ol class="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-700">
                      @for (question of quiz.questions; track question.id) {
                        <li>{{ question.question }}</li>
                      }
                    </ol>
                  </article>
                }
              </div>
            </div>
          }

          @if (loading()) {
            <p class="mt-6 text-slate-600">Loading questions…</p>
          } @else if (questions().length === 0) {
            <p class="mt-6 rounded-3xl bg-slate-50 p-5 text-slate-700">No questions yet. Create the first one to start practicing.</p>
          } @else {
            <div class="mt-6 space-y-4">
              @for (question of questions(); track question.id) {
                <article class="rounded-3xl border border-slate-200 bg-white p-5">
                  <p class="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Question #{{ question.id }} · {{ question.type === 'SET_ANSWER' ? question.solutionCount + ' answers expected' : 'one answer' }}</p>
                  <h3 class="mt-2 text-xl font-black text-slate-950">{{ question.question }}</h3>
                  <form class="mt-4 flex flex-col gap-3" (ngSubmit)="attemptQuestion(question)">
                    @if (question.type === 'SET_ANSWER') {
                      <div class="grid gap-3 sm:grid-cols-2">
                        @for (index of solutionIndexes(question); track index) {
                          <input class="spartan-input" name="answer-{{ question.id }}-{{ index }}" [(ngModel)]="setAnswers[question.id][index]" required maxlength="1000" placeholder="Answer {{ index + 1 }}" />
                        }
                      </div>
                    } @else {
                      <input class="spartan-input" name="answer-{{ question.id }}" [(ngModel)]="answers[question.id]" required maxlength="1000" placeholder="Type your answer" />
                    }
                    <button type="submit" class="spartan-button spartan-button-primary shrink-0 self-start">Check</button>
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
  readonly quizzes = signal<Quiz[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly savingQuiz = signal(false);
  readonly createMessage = signal('');
  readonly quizMessage = signal('');
  readonly errorMessage = signal('');

  newQuestionType: QuestionType = 'SINGLE_ANSWER';
  newQuestion = '';
  newAnswer = '';
  newSetAnswers = '';
  newQuizTitle = '';
  newQuizDescription = '';
  selectedQuizQuestionIds: Record<number, boolean> = {};
  answers: Record<number, string> = {};
  setAnswers: Record<number, string[]> = {};

  constructor(public readonly auth: AuthService, private readonly questionService: QuestionService) {}

  ngOnInit(): void {
    this.loadQuestions();
    this.loadQuizzes();
  }

  loadQuestions(): void {
    this.loading.set(true);
    this.errorMessage.set('');
    this.questionService.list().subscribe({
      next: (questions) => {
        this.questions.set(questions);
        questions.forEach((question) => this.ensureSetAnswerSlots(question));
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not load questions. Please try again.');
        this.loading.set(false);
      },
    });
  }

  loadQuizzes(): void {
    this.questionService.listQuizzes().subscribe({
      next: (quizzes) => this.quizzes.set(quizzes),
      error: () => this.errorMessage.set('Could not load quizzes. Please try again.'),
    });
  }

  createQuestion(): void {
    if (!this.newQuestion.trim()) {
      this.errorMessage.set('Question is required.');
      return;
    }

    const answer = this.newQuestionType === 'SET_ANSWER' ? this.parseSetAnswers(this.newSetAnswers) : this.newAnswer.trim();
    if ((Array.isArray(answer) && answer.length < 2) || (!Array.isArray(answer) && !answer)) {
      this.errorMessage.set(this.newQuestionType === 'SET_ANSWER' ? 'Add at least two accepted answers.' : 'Question and answer are required.');
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.createMessage.set('');
    this.questionService.create(this.newQuestion, answer, this.newQuestionType).subscribe({
      next: (question) => {
        this.questions.update((questions) => [question, ...questions]);
        this.ensureSetAnswerSlots(question);
        this.newQuestion = '';
        this.newAnswer = '';
        this.newSetAnswers = '';
        this.createMessage.set('Question created.');
        this.saving.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not create the question. Please try again.');
        this.saving.set(false);
      },
    });
  }

  createQuiz(): void {
    const selectedQuestionIds = this.selectedQuestionIds();
    if (!this.newQuizTitle.trim()) {
      this.errorMessage.set('Quiz title is required.');
      return;
    }
    if (selectedQuestionIds.length < 2) {
      this.errorMessage.set('Choose at least two questions for the quiz.');
      return;
    }

    this.savingQuiz.set(true);
    this.errorMessage.set('');
    this.quizMessage.set('');
    this.questionService.createQuiz(this.newQuizTitle, this.newQuizDescription, selectedQuestionIds).subscribe({
      next: (quiz) => {
        this.quizzes.update((quizzes) => [quiz, ...quizzes]);
        this.newQuizTitle = '';
        this.newQuizDescription = '';
        this.selectedQuizQuestionIds = {};
        this.quizMessage.set('Quiz created.');
        this.savingQuiz.set(false);
      },
      error: () => {
        this.errorMessage.set('Could not create the quiz. Please try again.');
        this.savingQuiz.set(false);
      },
    });
  }

  attemptQuestion(question: BasicQuestion): void {
    const answer = question.type === 'SET_ANSWER'
      ? this.setAnswers[question.id]?.map((value) => value?.trim() ?? '') ?? []
      : this.answers[question.id]?.trim();
    if ((Array.isArray(answer) && answer.some((value) => !value)) || (!Array.isArray(answer) && !answer)) {
      this.errorMessage.set(question.type === 'SET_ANSWER' ? `Type ${question.solutionCount} answers before checking.` : 'Type an answer before checking.');
      return;
    }

    this.errorMessage.set('');
    this.questionService.attempt(question.id, answer).subscribe({
      next: (attempt) => this.attempts.update((attempts) => ({ ...attempts, [question.id]: attempt })),
      error: () => this.errorMessage.set('Could not check your answer. Please try again.'),
    });
  }

  solutionIndexes(question: BasicQuestion): number[] {
    this.ensureSetAnswerSlots(question);
    return Array.from({ length: question.solutionCount }, (_, index) => index);
  }

  private ensureSetAnswerSlots(question: BasicQuestion): void {
    if (question.type !== 'SET_ANSWER') {
      return;
    }
    const currentAnswers = this.setAnswers[question.id] ?? [];
    this.setAnswers[question.id] = Array.from({ length: question.solutionCount }, (_, index) => currentAnswers[index] ?? '');
  }

  private selectedQuestionIds(): number[] {
    return this.questions()
      .filter((question) => this.selectedQuizQuestionIds[question.id])
      .map((question) => question.id);
  }

  private parseSetAnswers(value: string): string[] {
    return value
      .split('\n')
      .map((answer) => answer.trim())
      .filter((answer) => answer.length > 0);
  }
}
