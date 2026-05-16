import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { MatchingInteraction, Question, QuestionSubmission } from '../question.models';

@Component({
  selector: 'app-match-input',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './match-input.component.html',
  styleUrls: ['./match-input.component.scss'],
})
export class MatchInputComponent {
  @Input({ required: true }) question!: Question;
  @Output() readonly submissionChange = new EventEmitter<QuestionSubmission | null>();

  selections: Record<string, string> = {};

  get interaction(): MatchingInteraction {
    return this.question.interaction as MatchingInteraction;
  }

  update(): void {
    const pairs = this.interaction.leftItems
      .map((leftItem) => ({ leftId: leftItem.id, rightId: this.selections[leftItem.id] }))
      .filter((pair) => pair.rightId);
    this.submissionChange.emit(pairs.length === this.interaction.leftItems.length
      ? { type: 'MATCH', response: { pairs } }
      : null);
  }
}
