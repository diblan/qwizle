import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuizModeCardComponent } from './quiz-mode-card.component';

describe('QuizModeCardComponent', () => {
  let fixture: ComponentFixture<QuizModeCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuizModeCardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(QuizModeCardComponent);
    fixture.componentRef.setInput('title', 'Classic Quiz');
    fixture.componentRef.setInput('description', 'Warm up with recall questions.');
    fixture.detectChanges();
  });

  it('renders the quiz mode title and description', () => {
    const compiled = fixture.nativeElement as HTMLElement;

    expect(compiled.textContent).toContain('Classic Quiz');
    expect(compiled.textContent).toContain('Warm up with recall questions.');
  });
});
