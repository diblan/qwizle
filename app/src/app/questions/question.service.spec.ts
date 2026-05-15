import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';

import { environment } from '../../environments/environment';
import { QuestionService } from './question.service';

describe('QuestionService', () => {
  let service: QuestionService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [QuestionService, provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(QuestionService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('lists basic questions', () => {
    service.list().subscribe((questions) => {
      expect(questions[0].question).toBe('What is retention?');
      expect(questions[0].type).toBe('SINGLE_ANSWER');
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, question: 'What is retention?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' }]);
  });

  it('creates a basic question', () => {
    service.create('Question?', 'Answer').subscribe((question) => {
      expect(question.id).toBe(2);
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ question: 'Question?', type: 'SINGLE_ANSWER', answer: 'Answer' });
    request.flush({ id: 2, question: 'Question?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' });
  });

  it('creates a set answer question', () => {
    service.create('Name the OSI layers.', ['Physical', 'Data Link'], 'SET_ANSWER').subscribe((question) => {
      expect(question.solutionCount).toBe(2);
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ question: 'Name the OSI layers.', type: 'SET_ANSWER', answers: ['Physical', 'Data Link'] });
    request.flush({ id: 3, question: 'Name the OSI layers.', type: 'SET_ANSWER', solutionCount: 2, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' });
  });

  it('attempts a basic question', () => {
    service.attempt(2, 'Answer').subscribe((attempt) => {
      expect(attempt.correct).toBeTrue();
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions/2/attempts`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ answer: 'Answer' });
    request.flush({ questionId: 2, submittedAnswer: 'Answer', submittedAnswers: [], correct: true, attemptedAt: '2026-05-15T00:00:00Z' });
  });

  it('attempts a set answer question', () => {
    service.attempt(3, ['Physical', 'Data Link']).subscribe((attempt) => {
      expect(attempt.submittedAnswers).toEqual(['Physical', 'Data Link']);
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions/3/attempts`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ answers: ['Physical', 'Data Link'] });
    request.flush({ questionId: 3, submittedAnswers: ['Physical', 'Data Link'], correct: true, attemptedAt: '2026-05-15T00:00:00Z' });
  });

  it('lists quizzes with their questions', () => {
    service.listQuizzes().subscribe((quizzes) => {
      expect(quizzes[0].title).toBe('OSI model basics');
      expect(quizzes[0].questions[0].question).toBe('Where does TCP live?');
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/quizzes`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 4, title: 'OSI model basics', description: 'Layer recall.', questionCount: 1, questions: [{ id: 3, question: 'Where does TCP live?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' }], createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' }]);
  });

  it('creates a quiz from existing question ids', () => {
    service.createQuiz('OSI model basics', 'Layer recall.', [2, 3]).subscribe((quiz) => {
      expect(quiz.questionCount).toBe(2);
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/quizzes`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ title: 'OSI model basics', description: 'Layer recall.', questionIds: [2, 3] });
    request.flush({ id: 4, title: 'OSI model basics', description: 'Layer recall.', questionCount: 2, questions: [], createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' });
  });

});
