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
      { id: 10, question: 'What is retrieval practice?', createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ]));
    questionService.create.and.returnValue(of(
      { id: 11, question: 'What does Qwizle train?', createdByUserId: 1, createdAt: '2026-05-15T00:00:00Z' },
    ));
    questionService.attempt.and.returnValue(of(
      { questionId: 10, submittedAnswer: 'Memory', correct: true, attemptedAt: '2026-05-15T00:00:00Z' },
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

  it('greets the logged-in learner and loads basic questions', () => {
    const text = (fixture.nativeElement as HTMLElement).textContent;

    expect(text).toContain('Good to see you, Demo Learner.');
    expect(text).toContain('Create a one-answer recall question');
    expect(text).toContain('What is retrieval practice?');
    expect(questionService.list).toHaveBeenCalled();
  });

  it('creates a basic question from the form', () => {
    const component = fixture.componentInstance;
    component.newQuestion = 'What does Qwizle train?';
    component.newAnswer = 'Memory';

    component.createQuestion();
    fixture.detectChanges();

    expect(questionService.create).toHaveBeenCalledWith('What does Qwizle train?', 'Memory');
    expect(component.questions()[0].question).toBe('What does Qwizle train?');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Question created.');
  });

  it('submits an attempt for a basic question', () => {
    const component = fixture.componentInstance;
    component.answers[10] = 'Memory';

    component.attemptQuestion(component.questions()[0]);
    fixture.detectChanges();

    expect(questionService.attempt).toHaveBeenCalledWith(10, 'Memory');
    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Correct — nice recall.');
  });
});
