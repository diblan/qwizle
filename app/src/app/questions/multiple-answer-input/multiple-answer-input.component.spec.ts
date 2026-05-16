import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleAnswerInputComponent } from './multiple-answer-input.component';

describe('MultipleAnswerInputComponent', () => {
  let fixture: ComponentFixture<MultipleAnswerInputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [MultipleAnswerInputComponent] }).compileComponents();
    fixture = TestBed.createComponent(MultipleAnswerInputComponent);
    fixture.componentRef.setInput('question', {
      id: 1,
      type: 'MULTIPLE_ANSWER',
      prompt: { text: 'Name two layers.', media: [] },
      interaction: { kind: 'TEXT_LIST', minAnswers: 2, maxAnswers: 2 },
      tags: [],
      createdByUserId: 1,
      createdAt: '2026-05-16T00:00:00Z',
    });
    fixture.detectChanges();
  });

  it('emits complete answer lists', () => {
    const component = fixture.componentInstance;
    spyOn(component.submissionChange, 'emit');

    component.answers = ['Physical', 'Data Link'];
    component.update();

    expect(component.submissionChange.emit).toHaveBeenCalledWith({ type: 'MULTIPLE_ANSWER', response: { answers: ['Physical', 'Data Link'] } });
  });
});
