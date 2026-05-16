import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { Question, QuestionSubmission, TextInteraction } from '../question.models';

@Component({
  selector: 'app-multiple-answer-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './multiple-answer-input.component.html',
  styleUrls: ['./multiple-answer-input.component.scss'],
})
export class MultipleAnswerInputComponent implements OnChanges {
  @Input({ required: true }) question!: Question;
  @Output() readonly submissionChange = new EventEmitter<QuestionSubmission | null>();

  answers: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['question']) {
      const interaction = this.question.interaction as TextInteraction;
      this.answers = Array.from({ length: interaction.maxAnswers }, (_, index) => this.answers[index] ?? '');
      this.update();
    }
  }

  update(): void {
    const cleanedAnswers = this.answers.map((answer) => answer.trim());
    this.submissionChange.emit(cleanedAnswers.every(Boolean)
      ? { type: 'MULTIPLE_ANSWER', response: { answers: cleanedAnswers } }
      : null);
  }
}
