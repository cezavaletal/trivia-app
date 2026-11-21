import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-streak-badge',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="streak-badge" [class.streak-badge--active]="isActive()" [attr.aria-label]="'Racha: ' + streak() + ' aciertos'">
      <span class="fire-icon">🔥</span>
      <span class="streak-text">x{{ streak() }}</span>
      @if (multiplier() > 1) {
        <span class="multiplier-tag">({{ multiplier().toFixed(1) }}x)</span>
      }
    </div>
  `,
  styles: [`
    .streak-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 14px;
      border-radius: var(--radius-full);
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: var(--accent-gold);
      font-family: var(--font-display);
      font-weight: 700;
      font-size: 14px;
      user-select: none;
      transition: all var(--transition-fast);
    }

    .fire-icon {
      font-size: 16px;
      display: inline-block;
    }

    .multiplier-tag {
      font-size: 12px;
      opacity: 0.85;
      font-weight: 600;
    }

    .streak-badge--active {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.25), rgba(239, 68, 68, 0.25));
      border-color: var(--brand-accent-amber);
      color: #FFF;
      animation: flame-glow 1.8s infinite ease-in-out;
      box-shadow: var(--glow-streak);
    }
  `]
})
export class StreakBadgeComponent {
  readonly streak = input<number>(0);
  readonly multiplier = input<number>(1.0);

  readonly isActive = computed(() => this.streak() >= 3);
}
