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
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions`);
    expect(request.request.method).toBe('GET');
    request.flush([{ id: 1, question: 'What is retention?', createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' }]);
  });

  it('creates a basic question', () => {
    service.create('Question?', 'Answer').subscribe((question) => {
      expect(question.id).toBe(2);
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ question: 'Question?', answer: 'Answer' });
    request.flush({ id: 2, question: 'Question?', createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' });
  });

  it('attempts a basic question', () => {
    service.attempt(2, 'Answer').subscribe((attempt) => {
      expect(attempt.correct).toBeTrue();
    });

    const request = httpTesting.expectOne(`${environment.apiBaseUrl}/questions/2/attempts`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ answer: 'Answer' });
    request.flush({ questionId: 2, submittedAnswer: 'Answer', correct: true, attemptedAt: '2026-05-15T00:00:00Z' });
  });
});
