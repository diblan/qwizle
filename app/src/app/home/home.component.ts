import { Component } from '@angular/core';

import { HomeHeaderComponent } from '../home-header/home-header.component';
import { QuizModeCardComponent } from '../quiz-mode-card/quiz-mode-card.component';

type QuizMode = {
  title: string;
  description: string;
};

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [HomeHeaderComponent, QuizModeCardComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  readonly quizModes: QuizMode[] = [
    {
      title: 'Classic Quiz',
      description: 'Warm up with a focused set of recall questions.',
    },
    {
      title: 'Daily Challenge',
      description: 'Take on today\'s challenge and build the habit.',
    },
    {
      title: 'Streak Mode',
      description: 'Keep your run alive with quick daily practice.',
    },
  ];
}
