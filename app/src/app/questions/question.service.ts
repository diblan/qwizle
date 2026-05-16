import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { apiUrl, RUNTIME_CONFIG, RuntimeConfig } from '../config/runtime-config';
import { CreateQuestionRequest, Question, QuestionAttempt, QuestionSubmission, Quiz } from './question.models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(
    private readonly http: HttpClient,
    @Inject(RUNTIME_CONFIG) private readonly config: RuntimeConfig,
  ) {}

  list(): Observable<Question[]> {
    return this.http.get<Question[]>(apiUrl(this.config, '/questions'));
  }

  create(request: CreateQuestionRequest): Observable<Question> {
    return this.http.post<Question>(apiUrl(this.config, '/questions'), request);
  }

  attempt(questionId: number, submission: QuestionSubmission): Observable<QuestionAttempt> {
    return this.http.post<QuestionAttempt>(apiUrl(this.config, `/questions/${questionId}/attempts`), submission);
  }

  listQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(apiUrl(this.config, '/quizzes'));
  }

  createQuiz(title: string, description: string, questionIds: number[]): Observable<Quiz> {
    return this.http.post<Quiz>(apiUrl(this.config, '/quizzes'), { title, description, questionIds });
  }
}
