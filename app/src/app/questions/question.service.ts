import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { CreateQuestionRequest, Question, QuestionAttempt, QuestionSubmission, Quiz } from './question.models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<Question[]> {
    return this.http.get<Question[]>(`${environment.apiBaseUrl}/questions`);
  }

  create(request: CreateQuestionRequest): Observable<Question> {
    return this.http.post<Question>(`${environment.apiBaseUrl}/questions`, request);
  }

  attempt(questionId: number, submission: QuestionSubmission): Observable<QuestionAttempt> {
    return this.http.post<QuestionAttempt>(`${environment.apiBaseUrl}/questions/${questionId}/attempts`, submission);
  }

  listQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiBaseUrl}/quizzes`);
  }

  createQuiz(title: string, description: string, questionIds: number[]): Observable<Quiz> {
    return this.http.post<Quiz>(`${environment.apiBaseUrl}/quizzes`, { title, description, questionIds });
  }
}
