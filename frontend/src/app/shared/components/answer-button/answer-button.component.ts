import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

export type AnswerState = 'DEFAULT' | 'SELECTED' | 'CORRECT' | 'INCORRECT' | 'TIMEOUT';

@Component({
  selector: 'app-answer-button',
  standalone: true,
  imports: [CommonModule],
  template: `
    <button
      type="button"
      class="answer-btn"
      [class.answer-btn--selected]="state() === 'SELECTED'"
      [class.answer-btn--correct]="state() === 'CORRECT'"
      [class.answer-btn--incorrect]="state() === 'INCORRECT'"
      [class.answer-btn--timeout]="state() === 'TIMEOUT'"
      [disabled]="disabled()"
      [attr.aria-keyshortcuts]="keyIndex()"
      (click)="onClick()"
    >
      <span class="key-badge">
        @switch (state()) {
          @case ('CORRECT') {
            <span class="icon-status">✓</span>
          }
          @case ('INCORRECT') {
            <span class="icon-status">✕</span>
          }
          @case ('TIMEOUT') {
            <span class="icon-status">⏱</span>
          }
          @default {
            <span>{{ keyIndex() }}</span>
          }
        }
      </span>
      <span class="answer-text">{{ answerText() }}</span>
    </button>
  `,
  styles: [`
    :host {
      display: block;
      width: 100%;
    }

    .key-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 36px;
      height: 36px;
      min-width: 36px;
      border-radius: var(--radius-sm);
      background-color: var(--surface-border);
      color: var(--text-primary);
      font-family: var(--font-mono);
      font-weight: 700;
      font-size: 15px;
      transition: all var(--transition-fast);
    }

    .answer-btn--correct .key-badge {
      background-color: var(--game-success);
      color: #FFFFFF;
    }

    .answer-btn--incorrect .key-badge {
      background-color: var(--game-danger);
      color: #FFFFFF;
    }

    .answer-text {
      flex: 1;
      font-family: var(--font-body);
      font-size: 16px;
      font-weight: 500;
      line-height: 1.4;
    }

    .icon-status {
      font-size: 18px;
      font-weight: 800;
    }
  `]
})
export class AnswerButtonComponent {
  readonly keyIndex = input<string>('1');
  readonly answerText = input<string>('');
  readonly state = input<AnswerState>('DEFAULT');
  readonly disabled = input<boolean>(false);

  readonly onAnswerSelect = output<void>();

  onClick(): void {
    if (!this.disabled() && this.state() === 'DEFAULT') {
      this.onAnswerSelect.emit();
    }
  }
}
