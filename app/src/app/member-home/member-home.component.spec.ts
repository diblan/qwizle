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
    questionService = jasmine.createSpyObj<QuestionService>('QuestionService', ['list', 'create', 'attempt']);
    questionService.list.and.returnValue(of([
      { id: 10, question: 'What is retrieval practice?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
      { id: 12, question: 'Name two OSI layers.', type: 'SET_ANSWER', solutionCount: 2, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ]));
    questionService.create.and.returnValue(of(
      { id: 11, question: 'What does Qwizle train?', type: 'SINGLE_ANSWER', solutionCount: 1, createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ));
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

    expect(text).toContain('Good to see you, Demo Learner.');
    expect(text).toContain('Create one-answer recall or fixed-size set questions');
    expect(text).toContain('What is retrieval practice?');
    expect(text).toContain('2 answers expected');
    expect(questionService.list).toHaveBeenCalled();
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
