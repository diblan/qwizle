import { Component, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { AuthService } from '../auth/auth.service';
import { QuestionRendererComponent } from '../questions/question-renderer/question-renderer.component';
import { CreateQuestionRequest, Question, QuestionAttempt, QuestionSubmission, QuestionType, Quiz } from '../questions/question.models';
import { QuestionService } from '../questions/question.service';

@Component({
  selector: 'app-member-home',
  standalone: true,
  imports: [FormsModule, RouterLink, QuestionRendererComponent],
  templateUrl: './member-home.component.html',
  styleUrls: ['./member-home.component.scss'],
})
export class MemberHomeComponent implements OnInit {
  readonly questions = signal<Question[]>([]);
  readonly attempts = signal<Record<number, QuestionAttempt>>({});
  readonly quizzes = signal<Quiz[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly savingQuiz = signal(false);
  readonly createMessage = signal('');
  readonly quizMessage = signal('');
  readonly errorMessage = signal('');

  newQuestionType: QuestionType = 'SINGLE_ANSWER';
  newPrompt = '';
  newAcceptedAnswers = '';
  newMultipleAnswerMode: 'ONE_OF_ACCEPTED' | 'REQUIRED_SET' = 'REQUIRED_SET';
  newChoiceSelectionMode: 'SINGLE' | 'MULTIPLE' = 'SINGLE';
  newChoiceOptions = '';
  newChoiceCorrectIds = '';
  newMatchLeftItems = '';
  newMatchRightItems = '';
  newMatchPairs = '';
  newExplanation = '';
  newQuizTitle = '';
  newQuizDescription = '';
  selectedQuizQuestionIds: Record<number, boolean> = {};

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
    if (!this.newPrompt.trim()) {
      this.errorMessage.set('Question is required.');
      return;
    }

    const request = this.buildCreateQuestionRequest();
    if (!request) {
      return;
    }

    this.saving.set(true);
    this.errorMessage.set('');
    this.createMessage.set('');
    this.questionService.create(request).subscribe({
      next: (question) => {
        this.questions.update((questions) => [question, ...questions]);
        this.resetQuestionForm();
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

  attemptQuestion(question: Question, submission: QuestionSubmission): void {
    this.errorMessage.set('');
    this.questionService.attempt(question.id, submission).subscribe({
      next: (attempt) => this.attempts.update((attempts) => ({ ...attempts, [question.id]: attempt })),
      error: () => this.errorMessage.set('Could not check your answer. Please try again.'),
    });
  }

  private selectedQuestionIds(): number[] {
    return this.questions()
      .filter((question) => this.selectedQuizQuestionIds[question.id])
      .map((question) => question.id);
  }

  private buildCreateQuestionRequest(): CreateQuestionRequest | null {
    const base = {
      type: this.newQuestionType,
      prompt: { text: this.newPrompt.trim(), media: [] },
      explanation: this.newExplanation.trim() || undefined,
    };

    if (this.newQuestionType === 'SINGLE_ANSWER') {
      const acceptedAnswers = this.parseLines(this.newAcceptedAnswers).map((text) => ({ text }));
      if (acceptedAnswers.length < 1) {
        this.errorMessage.set('Add at least one accepted answer.');
        return null;
      }
      return { ...base, definition: { acceptedAnswers } };
    }

    if (this.newQuestionType === 'MULTIPLE_ANSWER') {
      const answers = this.parseLines(this.newAcceptedAnswers).map((text, index) => ({ id: `answer-${index + 1}`, text }));
      if (answers.length < 2) {
        this.errorMessage.set('Add at least two answers.');
        return null;
      }
      return { ...base, definition: { mode: this.newMultipleAnswerMode, answers } };
    }

    if (this.newQuestionType === 'MULTIPLE_CHOICE') {
      const options = this.parseKeyedLines(this.newChoiceOptions).map((option) => ({
        id: option.id,
        content: { kind: 'TEXT' as const, text: option.text },
      }));
      const correctOptionIds = this.parseLines(this.newChoiceCorrectIds);
      if (options.length < 2 || correctOptionIds.length < 1) {
        this.errorMessage.set('Add at least two options and one correct option ID.');
        return null;
      }
      return { ...base, definition: { selectionMode: this.newChoiceSelectionMode, options, correctOptionIds } };
    }

    const leftItems = this.parseKeyedLines(this.newMatchLeftItems).map((item) => ({ id: item.id, content: { kind: 'TEXT' as const, text: item.text } }));
    const rightItems = this.parseKeyedLines(this.newMatchRightItems).map((item) => ({ id: item.id, content: { kind: 'TEXT' as const, text: item.text } }));
    const pairs = this.parsePairs(this.newMatchPairs);
    if (leftItems.length < 2 || rightItems.length < 2 || pairs.length !== leftItems.length) {
      this.errorMessage.set('Add at least two items per side and one pair for each left item.');
      return null;
    }
    return { ...base, definition: { leftItems, rightItems, pairs } };
  }

  private resetQuestionForm(): void {
    this.newPrompt = '';
    this.newAcceptedAnswers = '';
    this.newChoiceOptions = '';
    this.newChoiceCorrectIds = '';
    this.newMatchLeftItems = '';
    this.newMatchRightItems = '';
    this.newMatchPairs = '';
    this.newExplanation = '';
  }

  private parseLines(value: string): string[] {
    return value
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0);
  }

  private parseKeyedLines(value: string): Array<{ id: string; text: string }> {
    return this.parseLines(value)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex < 1) {
          return null;
        }
        return { id: line.slice(0, separatorIndex).trim(), text: line.slice(separatorIndex + 1).trim() };
      })
      .filter((item): item is { id: string; text: string } => !!item && !!item.id && !!item.text);
  }

  private parsePairs(value: string): Array<{ leftId: string; rightId: string }> {
    return this.parseLines(value)
      .map((line) => {
        const separatorIndex = line.indexOf(':');
        if (separatorIndex < 1) {
          return null;
        }
        return { leftId: line.slice(0, separatorIndex).trim(), rightId: line.slice(separatorIndex + 1).trim() };
      })
      .filter((pair): pair is { leftId: string; rightId: string } => !!pair && !!pair.leftId && !!pair.rightId);
  }
}
