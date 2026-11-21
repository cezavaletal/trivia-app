import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DifficultyLevel } from '../../../core/models';

@Component({
  selector: 'app-question-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <article class="question-card" aria-live="polite">
      <div class="card-meta">
        <span class="category-tag">{{ categoryName() }}</span>
        <span class="difficulty-badge" [class]="'difficulty--' + difficulty().toLowerCase()">
          {{ difficultyLabel() }}
        </span>
      </div>

      <h2 class="question-text">{{ questionText() }}</h2>
    </article>
  `,
  styles: [`
    .question-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-xl);
      padding: var(--space-6) var(--space-8);
      box-shadow: var(--shadow-elevation-mid);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      min-height: 160px;
      justify-content: center;
      transition: all var(--transition-normal);
    }

    @media (max-width: 640px) {
      .question-card {
        padding: var(--space-4);
        min-height: 130px;
      }
    }

    .card-meta {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-2);
    }

    .category-tag {
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--accent-cyan);
    }

    .difficulty-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 3px 10px;
      border-radius: var(--radius-sm);
      text-transform: uppercase;
      letter-spacing: 0.06em;
    }

    .difficulty--easy {
      background: rgba(16, 185, 129, 0.15);
      color: #34D399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .difficulty--medium {
      background: rgba(245, 158, 11, 0.15);
      color: #FBBF24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }

    .difficulty--hard {
      background: rgba(239, 68, 68, 0.15);
      color: #F87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }

    .question-text {
      font-family: var(--font-body);
      font-size: 24px;
      font-weight: 600;
      color: var(--text-primary);
      line-height: 1.35;
      margin: 0;
    }

    @media (max-width: 640px) {
      .question-text {
        font-size: 18px;
      }
    }
  `]
})
export class QuestionCardComponent {
  readonly questionText = input<string>('');
  readonly categoryName = input<string>('');
  readonly difficulty = input<DifficultyLevel>('MEDIUM');

  readonly difficultyLabel = computed(() => {
    switch (this.difficulty()) {
      case 'EASY': return 'Fácil';
      case 'MEDIUM': return 'Media';
      case 'HARD': return 'Difícil';
      default: return this.difficulty();
    }
  });
}
