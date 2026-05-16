import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { QuestionSubmission } from '../question.models';

@Component({
  selector: 'app-single-answer-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './single-answer-input.component.html',
  styleUrls: ['./single-answer-input.component.scss'],
})
export class SingleAnswerInputComponent {
  @Output() readonly submissionChange = new EventEmitter<QuestionSubmission | null>();

  answer = '';

  update(): void {
    const text = this.answer.trim();
    this.submissionChange.emit(text ? { type: 'SINGLE_ANSWER', response: { text } } : null);
  }
}
