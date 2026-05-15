import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BasicQuestion, BasicQuestionAttempt } from './question.models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<BasicQuestion[]> {
    return this.http.get<BasicQuestion[]>(`${environment.apiBaseUrl}/questions`);
  }

  create(question: string, answer: string): Observable<BasicQuestion> {
    return this.http.post<BasicQuestion>(`${environment.apiBaseUrl}/questions`, { question, answer });
  }

  attempt(questionId: number, answer: string): Observable<BasicQuestionAttempt> {
    return this.http.post<BasicQuestionAttempt>(`${environment.apiBaseUrl}/questions/${questionId}/attempts`, { answer });
  }
}
