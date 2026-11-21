import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progress-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progress-container">
      <div class="progress-track" role="progressbar" [attr.aria-valuenow]="current()" [attr.aria-valuemin]="0" [attr.aria-valuemax]="total()">
        <div class="progress-fill" [style.width.%]="percentage()" [class]="'fill-' + color()"></div>
      </div>
      @if (showLabel()) {
        <span class="progress-label">{{ current() }} / {{ total() }}</span>
      }
    </div>
  `,
  styles: [`
    .progress-container {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      width: 100%;
    }

    .progress-track {
      flex: 1;
      height: 10px;
      background: var(--neutral-800);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--surface-border);
      position: relative;
    }

    .progress-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width var(--transition-normal);
    }

    .fill-primary {
      background: linear-gradient(90deg, var(--brand-primary-500), var(--brand-accent-cyan));
    }

    .fill-success {
      background: linear-gradient(90deg, var(--game-success), #34D399);
    }

    .fill-warning {
      background: linear-gradient(90deg, var(--game-warning), #FBBF24);
    }

    .fill-danger {
      background: linear-gradient(90deg, var(--game-danger), #F87171);
    }

    .progress-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      font-family: var(--font-mono);
      min-width: 48px;
      text-align: right;
    }
  `]
})
export class ProgressBarComponent {
  readonly current = input<number>(0);
  readonly total = input<number>(10);
  readonly color = input<'primary' | 'success' | 'warning' | 'danger'>('primary');
  readonly showLabel = input<boolean>(true);

  readonly percentage = computed(() => {
    const t = this.total();
    if (t <= 0) return 0;
    return Math.min(100, Math.max(0, (this.current() / t) * 100));
  });
}
