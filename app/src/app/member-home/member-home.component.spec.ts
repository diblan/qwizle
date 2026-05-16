import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { Question } from '../questions/question.models';
import { QuestionService } from '../questions/question.service';
import { MemberHomeComponent } from './member-home.component';

describe('MemberHomeComponent', () => {
  let fixture: ComponentFixture<MemberHomeComponent>;
  let questionService: jasmine.SpyObj<QuestionService>;

  beforeEach(async () => {
    questionService = jasmine.createSpyObj<QuestionService>('QuestionService', ['list', 'create', 'attempt', 'listQuizzes', 'createQuiz']);
    questionService.list.and.returnValue(of([
      question(10, 'What is retrieval practice?'),
      multipleAnswerQuestion(12, 'Name two OSI layers?'),
    ]));
    questionService.create.and.returnValue(of(
      question(11, 'What does Qwizle train?'),
    ));
    questionService.listQuizzes.and.returnValue(of([
      {
        id: 20,
        title: 'OSI model basics',
        description: 'TCP placement and layer names.',
        questionCount: 2,
        questions: [
          question(10, 'What is retrieval practice?'),
          multipleAnswerQuestion(12, 'Name two OSI layers?'),
        ],
        createdByUserId: 1,
        createdAt: '2026-05-15T00:00:00Z',
      },
    ]));
    questionService.createQuiz.and.returnValue(of({
      id: 21,
      title: 'Memory basics',
      description: 'Two starter prompts.',
      questionCount: 2,
      questions: [],
      createdByUserId: 1,
      createdAt: '2026-05-15T00:00:00Z',
    }));
    questionService.attempt.and.returnValue(of(
      { attemptId: 1, questionId: 10, correct: true, score: 1, maxScore: 1, feedback: { message: 'Correct.' }, attemptedAt: '2026-05-15T00:00:00Z' },
    ));

    await TestBed.configureTestingModule({
      imports: [MemberHomeComponent],
      providers: [
        { provide: AuthService, useValue: { user: signal({ id: 1, email: 'learner@qwizle.test', displayName: 'Demo Learner' }) } },
        { provide: QuestionService, useValue: questionService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MemberHomeComponent);
    fixture.detectChanges();
  });

  it('greets the logged-in learner and loads questions', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(text).toContain('Home');
    expect(text).toContain('Good to see you, Demo Learner.');
    expect(text).toContain('Your quizzes');
    expect(text).toContain('OSI model basics');
    expect(questionService.listQuizzes).toHaveBeenCalled();
  });

  it('creates a basic question from the form', () => {
    const component = fixture.componentInstance;
    component.newPrompt = 'What does Qwizle train?';
    component.newAcceptedAnswers = 'Memory';

    component.createQuestion();
    fixture.detectChanges();

    expect(questionService.create).toHaveBeenCalledWith({
      type: 'SINGLE_ANSWER',
      prompt: { text: 'What does Qwizle train?', media: [] },
      explanation: undefined,
      definition: { acceptedAnswers: [{ text: 'Memory' }] },
    });
    expect(component.questions()[0].prompt.text).toBe('What does Qwizle train?');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Question created.');
  });

  it('creates a multiple-answer question from newline-delimited answers', () => {
    const component = fixture.componentInstance;
    questionService.create.and.returnValue(of(
      multipleAnswerQuestion(13, 'Name two OSI layers.'),
    ));
    component.newQuestionType = 'MULTIPLE_ANSWER';
    component.newPrompt = 'Name two OSI layers.';
    component.newAcceptedAnswers = 'Physical\nData Link';

    component.createQuestion();

    expect(questionService.create).toHaveBeenCalledWith({
      type: 'MULTIPLE_ANSWER',
      prompt: { text: 'Name two OSI layers.', media: [] },
      explanation: undefined,
      definition: {
        mode: 'REQUIRED_SET',
        answers: [{ id: 'answer-1', text: 'Physical' }, { id: 'answer-2', text: 'Data Link' }],
      },
    });
  });


  it('creates a quiz from selected existing questions', () => {
    const component = fixture.componentInstance;
    component.newQuizTitle = 'Memory basics';
    component.newQuizDescription = 'Two starter prompts.';
    component.selectedQuizQuestionIds = { 10: true, 12: true };

    component.createQuiz();
    fixture.detectChanges();

    expect(questionService.createQuiz).toHaveBeenCalledWith('Memory basics', 'Two starter prompts.', [10, 12]);
    expect(component.quizzes()[0].title).toBe('Memory basics');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Quiz created.');
  });

  it('submits an attempt for a basic question', () => {
    const component = fixture.componentInstance;
    const submission = { type: 'SINGLE_ANSWER' as const, response: { text: 'Memory' } };

    component.attemptQuestion(component.questions()[0], submission);
    fixture.detectChanges();

    expect(questionService.attempt).toHaveBeenCalledWith(10, submission);
  });

  it('submits an attempt for a multiple-answer question', () => {
    const component = fixture.componentInstance;
    questionService.attempt.and.returnValue(of(
      { attemptId: 2, questionId: 12, correct: true, score: 1, maxScore: 1, feedback: { message: 'Correct.' }, attemptedAt: '2026-05-15T00:00:00Z' },
    ));
    const multipleAnswerQuestion = component.questions()[1];
    const submission = { type: 'MULTIPLE_ANSWER' as const, response: { answers: ['Physical', 'Data Link'] } };

    component.attemptQuestion(multipleAnswerQuestion, submission);

    expect(questionService.attempt).toHaveBeenCalledWith(12, submission);
  });
});

function question(id: number, text: string): Question {
  return {
    id,
    type: 'SINGLE_ANSWER' as const,
    prompt: { text, media: [] },
    interaction: { kind: 'TEXT' as const, minAnswers: 1, maxAnswers: 1 },
    tags: [],
    createdByUserId: 1,
    createdAt: '2026-05-15T00:00:00Z',
  };
}

function multipleAnswerQuestion(id: number, text: string): Question {
  return {
    ...question(id, text),
    type: 'MULTIPLE_ANSWER',
    interaction: { kind: 'TEXT_LIST', minAnswers: 2, maxAnswers: 2 },
  };
}
