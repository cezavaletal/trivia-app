import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-timer-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="timer-wrapper">
      <div class="timer-dial" [class.timer--critical]="isCritical()" [attr.aria-label]="'Tiempo restante: ' + remainingSeconds() + ' segundos'">
        <span class="timer-seconds">{{ formattedSeconds() }}</span>
        <span class="timer-label">SEG</span>
      </div>
      <div class="timer-bar-track">
        <div 
          class="timer-bar-fill" 
          [style.width.%]="percentage()" 
          [class.fill-green]="colorState() === 'green'"
          [class.fill-yellow]="colorState() === 'yellow'"
          [class.fill-red]="colorState() === 'red'"
        ></div>
      </div>
    </div>
  `,
  styles: [`
    .timer-wrapper {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
      width: 100%;
      max-width: 460px;
      margin: 0 auto;
    }

    .timer-dial {
      display: flex;
      align-items: baseline;
      gap: 4px;
      padding: 6px 16px;
      border-radius: var(--radius-full);
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      box-shadow: var(--shadow-elevation-low);
      transition: color var(--transition-fast), border-color var(--transition-fast);
    }

    .timer-seconds {
      font-family: var(--font-mono);
      font-size: 32px;
      font-weight: 700;
      line-height: 1;
      font-variant-numeric: tabular-nums;
      color: var(--text-primary);
    }

    .timer-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: var(--text-muted);
    }

    .timer-bar-track {
      width: 100%;
      height: 8px;
      background: var(--neutral-800);
      border-radius: var(--radius-full);
      overflow: hidden;
      border: 1px solid var(--surface-border);
    }

    .timer-bar-fill {
      height: 100%;
      border-radius: var(--radius-full);
      transition: width 200ms linear, background-color var(--transition-fast);
    }

    .fill-green {
      background: linear-gradient(90deg, #10B981, #059669);
      box-shadow: 0 0 10px rgba(16, 185, 129, 0.5);
    }

    .fill-yellow {
      background: linear-gradient(90deg, #F59E0B, #D97706);
      box-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
    }

    .fill-red {
      background: linear-gradient(90deg, #EF4444, #B91C1C);
      box-shadow: 0 0 12px rgba(239, 68, 68, 0.7);
    }

    .timer--critical {
      border-color: var(--game-danger);
      animation: timer-warning-pulse 600ms infinite ease-in-out;
    }

    .timer--critical .timer-seconds {
      color: var(--game-danger);
    }
  `]
})
export class TimerBarComponent {
  readonly totalSeconds = input<number>(15);
  readonly remainingSeconds = input<number>(15);
  readonly isPaused = input<boolean>(false);

  readonly onTimeout = output<void>();
  readonly onTick = output<number>();

  readonly percentage = computed(() => {
    const total = this.totalSeconds();
    if (total <= 0) return 0;
    return Math.max(0, Math.min(100, (this.remainingSeconds() / total) * 100));
  });

  readonly formattedSeconds = computed(() => {
    const sec = this.remainingSeconds();
    return sec < 10 ? `0${sec}` : `${sec}`;
  });

  readonly colorState = computed<'green' | 'yellow' | 'red'>(() => {
    const p = this.percentage();
    if (p > 50) return 'green';
    if (p > 25) return 'yellow';
    return 'red';
  });

  readonly isCritical = computed(() => {
    return this.remainingSeconds() <= 3 && this.remainingSeconds() > 0;
  });
}
