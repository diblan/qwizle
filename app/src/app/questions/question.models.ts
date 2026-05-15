export interface BasicQuestion {
  id: number;
  question: string;
  createdByUserId: number;
  createdAt: string;
}

export interface BasicQuestionAttempt {
  questionId: number;
  submittedAnswer: string;
  correct: boolean;
  attemptedAt: string;
}
