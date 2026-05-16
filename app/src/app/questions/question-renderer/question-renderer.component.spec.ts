import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuestionRendererComponent } from './question-renderer.component';

describe('QuestionRendererComponent', () => {
  let fixture: ComponentFixture<QuestionRendererComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [QuestionRendererComponent] }).compileComponents();
    fixture = TestBed.createComponent(QuestionRendererComponent);
    fixture.componentRef.setInput('question', {
      id: 1,
      type: 'SINGLE_ANSWER',
      prompt: { text: 'What does HTTP stand for?', media: [] },
      interaction: { kind: 'TEXT', minAnswers: 1, maxAnswers: 1 },
      tags: [],
      createdByUserId: 1,
      createdAt: '2026-05-16T00:00:00Z',
    });
    fixture.detectChanges();
  });

  it('renders the prompt and emits completed submissions', () => {
    const component = fixture.componentInstance;
    spyOn(component.submitAttempt, 'emit');

    component.setSubmission({ type: 'SINGLE_ANSWER', response: { text: 'Hypertext Transfer Protocol' } });
    component.submit();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('What does HTTP stand for?');
    expect(component.submitAttempt.emit).toHaveBeenCalledWith({ type: 'SINGLE_ANSWER', response: { text: 'Hypertext Transfer Protocol' } });
  });

  it('shows validation for empty submissions', () => {
    fixture.componentInstance.submit();
    fixture.detectChanges();

    expect((fixture.nativeElement as HTMLElement).textContent).toContain('Complete the answer before checking.');
  });
});
