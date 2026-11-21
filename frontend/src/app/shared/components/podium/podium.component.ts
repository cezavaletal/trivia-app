import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LeaderboardPlayer } from '../../../core/models';

@Component({
  selector: 'app-podium',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="podium-container">
      <!-- #2 Plata -->
      @if (second(); as p2) {
        <div class="podium-column podium-silver" (click)="onPlayerClick.emit(p2.username)">
          <div class="avatar-ring">
            <span class="avatar-icon">🥈</span>
          </div>
          <span class="player-name">{{ p2.username }}</span>
          <span class="player-score">{{ p2.totalScore ?? p2.score ?? 0 | number }} pts</span>
          <div class="pedestal pedestal-2">
            <span class="rank-number">2</span>
          </div>
        </div>
      }

      <!-- #1 Oro -->
      @if (first(); as p1) {
        <div class="podium-column podium-gold" (click)="onPlayerClick.emit(p1.username)">
          <div class="crown-icon">👑</div>
          <div class="avatar-ring avatar-ring--gold">
            <span class="avatar-icon">🥇</span>
          </div>
          <span class="player-name player-name--gold">{{ p1.username }}</span>
          <span class="player-score player-score--gold">{{ p1.totalScore ?? p1.score ?? 0 | number }} pts</span>
          <div class="pedestal pedestal-1">
            <span class="rank-number">1</span>
          </div>
        </div>
      }

      <!-- #3 Bronce -->
      @if (third(); as p3) {
        <div class="podium-column podium-bronze" (click)="onPlayerClick.emit(p3.username)">
          <div class="avatar-ring">
            <span class="avatar-icon">🥉</span>
          </div>
          <span class="player-name">{{ p3.username }}</span>
          <span class="player-score">{{ p3.totalScore ?? p3.score ?? 0 | number }} pts</span>
          <div class="pedestal pedestal-3">
            <span class="rank-number">3</span>
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .podium-container {
      display: flex;
      align-items: flex-end;
      justify-content: center;
      gap: var(--space-4);
      padding: var(--space-6) 0 var(--space-2);
      max-width: 550px;
      margin: 0 auto;
    }

    .podium-column {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      cursor: pointer;
      transition: transform var(--transition-fast);
    }

    .podium-column:hover {
      transform: translateY(-4px);
    }

    .crown-icon {
      font-size: 26px;
      margin-bottom: -6px;
      animation: flame-glow 2s infinite ease-in-out;
    }

    .avatar-ring {
      width: 64px;
      height: 64px;
      border-radius: var(--radius-full);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-card);
      border: 3px solid var(--surface-border);
      box-shadow: var(--shadow-elevation-low);
      margin-bottom: var(--space-2);
    }

    .avatar-ring--gold {
      width: 76px;
      height: 76px;
      border-color: #FBBF24;
      box-shadow: 0 0 16px rgba(251, 191, 36, 0.4);
    }

    .avatar-icon {
      font-size: 28px;
    }

    .avatar-ring--gold .avatar-icon {
      font-size: 36px;
    }

    .player-name {
      font-family: var(--font-body);
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary);
      max-width: 120px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .player-name--gold {
      font-size: 16px;
      color: #FBBF24;
    }

    .player-score {
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      margin-bottom: var(--space-2);
    }

    .player-score--gold {
      font-size: 14px;
      color: var(--text-primary);
    }

    .pedestal {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: var(--radius-md) var(--radius-md) 0 0;
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 800;
    }

    .pedestal-1 {
      height: 120px;
      background: linear-gradient(180deg, rgba(251, 191, 36, 0.35), rgba(251, 191, 36, 0.08));
      border: 2px solid #FBBF24;
      border-bottom: none;
      color: #FBBF24;
      box-shadow: 0 -4px 16px rgba(251, 191, 36, 0.25);
    }

    .pedestal-2 {
      height: 90px;
      background: linear-gradient(180deg, rgba(203, 213, 225, 0.3), rgba(203, 213, 225, 0.05));
      border: 2px solid #94A3B8;
      border-bottom: none;
      color: #CBD5E1;
    }

    .pedestal-3 {
      height: 70px;
      background: linear-gradient(180deg, rgba(217, 119, 6, 0.25), rgba(217, 119, 6, 0.05));
      border: 2px solid #B45309;
      border-bottom: none;
      color: #D97706;
    }
  `]
})
export class PodiumComponent {
  readonly players = input<LeaderboardPlayer[]>([]);
  readonly onPlayerClick = output<string>();

  readonly first = computed(() => this.players()[0] || null);
  readonly second = computed(() => this.players()[1] || null);
  readonly third = computed(() => this.players()[2] || null);
}
