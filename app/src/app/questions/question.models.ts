export type QuestionType = 'SINGLE_ANSWER' | 'SET_ANSWER';

export interface BasicQuestion {
  id: number;
  question: string;
  type: QuestionType;
  solutionCount: number;
  createdByUserId: number;
  createdAt: string;
}

export interface BasicQuestionAttempt {
  questionId: number;
  submittedAnswer?: string;
  submittedAnswers: string[];
  correct: boolean;
  attemptedAt: string;
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  questionCount: number;
  questions: BasicQuestion[];
  createdByUserId: number;
  createdAt: string;
}
