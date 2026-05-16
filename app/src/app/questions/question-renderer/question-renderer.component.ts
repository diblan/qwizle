import { Component, EventEmitter, Input, Output } from '@angular/core';

import { MatchInputComponent } from '../match-input/match-input.component';
import { MultipleAnswerInputComponent } from '../multiple-answer-input/multiple-answer-input.component';
import { MultipleChoiceInputComponent } from '../multiple-choice-input/multiple-choice-input.component';
import { Question, QuestionAttempt, QuestionSubmission } from '../question.models';
import { SingleAnswerInputComponent } from '../single-answer-input/single-answer-input.component';

@Component({
  selector: 'app-question-renderer',
  standalone: true,
  imports: [SingleAnswerInputComponent, MultipleAnswerInputComponent, MultipleChoiceInputComponent, MatchInputComponent],
  templateUrl: './question-renderer.component.html',
  styleUrls: ['./question-renderer.component.scss'],
})
export class QuestionRendererComponent {
  @Input({ required: true }) question!: Question;
  @Input() attempt?: QuestionAttempt;
  @Input() checking = false;
  @Output() readonly submitAttempt = new EventEmitter<QuestionSubmission>();

  private submission: QuestionSubmission | null = null;
  validationMessage = '';

  setSubmission(submission: QuestionSubmission | null): void {
    this.submission = submission;
    if (submission) {
      this.validationMessage = '';
    }
  }

  submit(): void {
    if (!this.submission) {
      this.validationMessage = 'Complete the answer before checking.';
      return;
    }
    this.submitAttempt.emit(this.submission);
  }
}
