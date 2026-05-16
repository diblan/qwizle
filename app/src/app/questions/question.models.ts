export type QuestionType = 'SINGLE_ANSWER' | 'MULTIPLE_ANSWER' | 'MULTIPLE_CHOICE' | 'MATCH';

export type ContentKind = 'TEXT' | 'IMAGE';

export interface ContentBlock {
  kind: ContentKind;
  text?: string;
  url?: string;
  altText?: string;
}

export interface QuestionPrompt {
  text: string;
  media: ContentBlock[];
}

export interface TextInteraction {
  kind: 'TEXT' | 'TEXT_LIST';
  minAnswers: number;
  maxAnswers: number;
}

export type ChoiceSelectionMode = 'SINGLE' | 'MULTIPLE';

export interface QuestionOption {
  id: string;
  content: ContentBlock;
}

export interface OptionSelectionInteraction {
  kind: 'OPTION_SELECTION';
  selectionMode: ChoiceSelectionMode;
  options: QuestionOption[];
}

export interface MatchItem {
  id: string;
  content: ContentBlock;
}

export interface MatchPair {
  leftId: string;
  rightId: string;
}

export interface MatchingInteraction {
  kind: 'MATCHING';
  leftItems: MatchItem[];
  rightItems: MatchItem[];
}

export type QuestionInteraction = TextInteraction | OptionSelectionInteraction | MatchingInteraction;

export interface Question {
  id: number;
  type: QuestionType;
  prompt: QuestionPrompt;
  interaction: QuestionInteraction;
  difficulty?: string;
  tags: string[];
  createdByUserId: number;
  createdAt: string;
}

export interface QuestionSubmission {
  type: QuestionType;
  response: Record<string, unknown>;
}

export interface AttemptFeedback {
  message: string;
  explanation?: string;
  revealedSolution?: unknown;
}

export interface QuestionAttempt {
  attemptId: number;
  questionId: number;
  correct: boolean;
  score: number;
  maxScore: number;
  feedback: AttemptFeedback;
  attemptedAt: string;
}

export interface CreateQuestionRequest {
  type: QuestionType;
  prompt: { text: string; media?: ContentBlock[] };
  definition: Record<string, unknown>;
  explanation?: string;
  difficulty?: string;
  tags?: string[];
}

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  questionCount: number;
  questions: Question[];
  createdByUserId: number;
  createdAt: string;
}
