import { Component, input } from '@angular/core';

@Component({
  selector: 'app-quiz-mode-card',
  standalone: true,
  imports: [],
  templateUrl: './quiz-mode-card.component.html',
  styleUrls: ['./quiz-mode-card.component.scss'],
})
export class QuizModeCardComponent {
  readonly title = input.required<string>();
  readonly description = input.required<string>();
}
