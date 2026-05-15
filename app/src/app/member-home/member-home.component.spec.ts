import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { of } from 'rxjs';

import { AuthService } from '../auth/auth.service';
import { QuestionService } from '../questions/question.service';
import { MemberHomeComponent } from './member-home.component';

describe('MemberHomeComponent', () => {
  let fixture: ComponentFixture<MemberHomeComponent>;
  let questionService: jasmine.SpyObj<QuestionService>;

  beforeEach(async () => {
    questionService = jasmine.createSpyObj<QuestionService>('QuestionService', ['list', 'create', 'attempt', 'listQuizzes', 'createQuiz']);
    questionService.list.and.returnValue(of([
      { id: 10, question: 'What is retrieval practice?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
      { id: 12, question: 'Name two OSI layers.', type: 'SET_ANSWER', solutionCount: 2, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ]));
    questionService.create.and.returnValue(of(
      { id: 11, question: 'What does Qwizle train?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ));
    questionService.listQuizzes.and.returnValue(of([
      {
        id: 20,
        title: 'OSI model basics',
        description: 'TCP placement and layer names.',
        questionCount: 2,
        questions: [
          { id: 10, question: 'What is retrieval practice?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
          { id: 12, question: 'Name two OSI layers.', type: 'SET_ANSWER', solutionCount: 2, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
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
      { questionId: 10, submittedAnswer: 'Memory', submittedAnswers: [], correct: true, attemptedAt: '2026-05-15T00:00:00Z' },
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
    component.newQuestion = 'What does Qwizle train?';
    component.newAnswer = 'Memory';

    component.createQuestion();
    fixture.detectChanges();

    expect(questionService.create).toHaveBeenCalledWith('What does Qwizle train?', 'Memory', 'SINGLE_ANSWER');
    expect(component.questions()[0].question).toBe('What does Qwizle train?');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Question created.');
  });

  it('creates a set answer question from newline-delimited answers', () => {
    const component = fixture.componentInstance;
    questionService.create.and.returnValue(of(
      { id: 13, question: 'Name two OSI layers.', type: 'SET_ANSWER', solutionCount: 2, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ));
    component.newQuestionType = 'SET_ANSWER';
    component.newQuestion = 'Name two OSI layers.';
    component.newSetAnswers = 'Physical\nData Link';

    component.createQuestion();

    expect(questionService.create).toHaveBeenCalledWith('Name two OSI layers.', ['Physical', 'Data Link'], 'SET_ANSWER');
    expect(component.setAnswers[13]).toEqual(['', '']);
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
    component.answers[10] = 'Memory';

    component.attemptQuestion(component.questions()[0]);
    fixture.detectChanges();

    expect(questionService.attempt).toHaveBeenCalledWith(10, 'Memory');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Correct — nice recall.');
  });

  it('submits an attempt for a set answer question', () => {
    const component = fixture.componentInstance;
    questionService.attempt.and.returnValue(of(
      { questionId: 12, submittedAnswers: ['Physical', 'Data Link'], correct: true, attemptedAt: '2026-05-15T00:00:00Z' },
    ));
    const setQuestion = component.questions()[1];
    component.setAnswers[12] = ['Physical', 'Data Link'];

    component.attemptQuestion(setQuestion);

    expect(questionService.attempt).toHaveBeenCalledWith(12, ['Physical', 'Data Link']);
  });
});
