import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { RUNTIME_CONFIG } from '../config/runtime-config';
import { QuestionService } from './question.service';

const apiBaseUrl = 'https://api.example.test/api';

describe('QuestionService', () => {
  let service: QuestionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        QuestionService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: RUNTIME_CONFIG, useValue: { apiBaseUrl } },
      ],
    });

    service = TestBed.inject(QuestionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('lists questions', () => {
    service.list().subscribe((questions) => {
      expect(questions[0].prompt.text).toBe('What is retention?');
      expect(questions[0].type).toBe('SINGLE_ANSWER');
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/questions`);
    expect(request.request.method).toBe('GET');
    request.flush([questionResponse(1, 'What is retention?')]);
  });

  it('creates a question', () => {
    const body = {
      type: 'SINGLE_ANSWER' as const,
      prompt: { text: 'Question?' },
      definition: { acceptedAnswers: [{ text: 'Answer' }] },
    };

    service.create(body).subscribe((question) => {
      expect(question.id).toBe(2);
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/questions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(body);
    request.flush(questionResponse(2, 'Question?'));
  });

  it('attempts a question', () => {
    const submission = { type: 'SINGLE_ANSWER' as const, response: { text: 'Answer' } };
    service.attempt(2, submission).subscribe((attempt) => {
      expect(attempt.correct).toBeTrue();
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/questions/2/attempts`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(submission);
    request.flush({ attemptId: 1, questionId: 2, correct: true, score: 1, maxScore: 1, feedback: { message: 'Correct.' }, attemptedAt: '2026-05-15T00:00:00Z' });
  });

  it('lists quizzes with their questions', () => {
    service.listQuizzes().subscribe((quizzes) => {
      expect(quizzes[0].title).toBe('OSI model basics');
      expect(quizzes[0].questions[0].prompt.text).toBe('Where does TCP live?');
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/quizzes`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 4, title: 'OSI model basics', description: 'Layer recall.', questionCount: 1, questions: [questionResponse(3, 'Where does TCP live?')], createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' }]);
  });

  it('creates a quiz from existing question ids', () => {
    service.createQuiz('OSI model basics', 'Layer recall.', [2, 3]).subscribe((quiz) => {
      expect(quiz.questionCount).toBe(2);
    });

    const request = httpTesting.expectOne(`${apiBaseUrl}/quizzes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'OSI model basics', description: 'Layer recall.', questionIds: [2, 3] });
    request.flush({ id: 4, title: 'OSI model basics', description: 'Layer recall.', questionCount: 2, questions: [], createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' });
  });

});

function questionResponse(id: number, text: string) {
  return {
    id,
    type: 'SINGLE_ANSWER',
    prompt: { text, media: [] },
    interaction: { kind: 'TEXT', minAnswers: 1, maxAnswers: 1 },
    tags: [],
    createdByUserId: 1,
    createdAt: '2026-05-15T00:00:00Z',
  };
}
