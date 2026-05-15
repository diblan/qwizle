import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { BasicQuestion, BasicQuestionAttempt, QuestionType, Quiz } from '../questions/question.models';
import { QuestionService } from '../questions/question.service';

@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './member-home.component.html',
  styleUrls: ['./member-home.component.scss'],
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
