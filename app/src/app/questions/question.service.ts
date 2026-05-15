import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { environment } from '../../environments/environment';
import { BasicQuestion, BasicQuestionAttempt, QuestionType, Quiz } from './question.models';

@Injectable({ providedIn: 'root' })
export class QuestionService {
  constructor(private readonly http: HttpClient) {}

  list(): Observable<BasicQuestion[]> {
    return this.http.get<BasicQuestion[]>(`${environment.apiBaseUrl}/questions`);
  }

  create(question: string, answer: string | string[], type: QuestionType = 'SINGLE_ANSWER'): Observable<BasicQuestion> {
    const body = type === 'SET_ANSWER'
      ? { question, type, answers: answer as string[] }
      : { question, type, answer: answer as string };
    return this.http.post<BasicQuestion>(`${environment.apiBaseUrl}/questions`, body);
  }

  attempt(questionId: number, answer: string | string[]): Observable<BasicQuestionAttempt> {
    const body = Array.isArray(answer) ? { answers: answer } : { answer };
    return this.http.post<BasicQuestionAttempt>(`${environment.apiBaseUrl}/questions/${questionId}/attempts`, body);
  }

  listQuizzes(): Observable<Quiz[]> {
    return this.http.get<Quiz[]>(`${environment.apiBaseUrl}/quizzes`);
  }

  createQuiz(title: string, description: string, questionIds: number[]): Observable<Quiz> {
    return this.http.post<Quiz>(`${environment.apiBaseUrl}/quizzes`, { title, description, questionIds });
  }
}
