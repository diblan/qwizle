import { Component, EventEmitter, Input, Output } from '@angular/core';

import { OptionSelectionInteraction, Question, QuestionSubmission } from '../question.models';

@Component({
  selector: 'app-multiple-choice-input',
  standalone: true,
  templateUrl: './multiple-choice-input.component.html',
  styleUrls: ['./multiple-choice-input.component.scss'],
})
export class MultipleChoiceInputComponent {
  @Input({ required: true }) question!: Question;
  @Output() readonly submissionChange = new EventEmitter<QuestionSubmission | null>();

  selectedIds = new Set<string>();

  get interaction(): OptionSelectionInteraction {
    return this.question.interaction as OptionSelectionInteraction;
  }

  setSingle(optionId: string): void {
    this.selectedIds = new Set([optionId]);
    this.emitSelection();
  }

  toggleMultiple(optionId: string, checked: boolean): void {
    const nextIds = new Set(this.selectedIds);
    if (checked) {
      nextIds.add(optionId);
    } else {
      nextIds.delete(optionId);
    }
    this.selectedIds = nextIds;
    this.emitSelection();
  }

  private emitSelection(): void {
    const selectedOptionIds = Array.from(this.selectedIds);
    this.submissionChange.emit(selectedOptionIds.length > 0
      ? { type: 'MULTIPLE_CHOICE', response: { selectedOptionIds } }
      : null);
  }
}
