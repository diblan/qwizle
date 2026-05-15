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
