import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { GameSummary } from '../../core/models';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-game-results',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent],
  template: `
    <app-header />

    <main class="results-container">
      @if (summary(); as s) {
        <div class="results-card">
          <!-- TITLE -->
          <div class="results-header">
            <span class="celebration-badge">🎉 ¡PARTIDA COMPLETADA! 🎉</span>
            <h1 class="results-title">Resumen de Rendimiento</h1>
          </div>

          <!-- SCORE BOX -->
          <div class="score-display">
            <span class="score-label">PUNTAJE FINAL</span>
            <div class="score-value">{{ s.finalScore | number }}</div>
            <span class="score-unit">PUNTOS</span>

            @if (s.leaderboardUpdate?.isPersonalBest) {
              <div class="record-badge">
                🌟 ¡Nuevo Récord Personal! 🌟
              </div>
            }
          </div>

          <!-- PERFORMANCE GRID -->
          <div class="metrics-grid">
            <div class="metric-card metric--success">
              <span class="metric-icon">✅</span>
              <div class="metric-info">
                <span class="metric-value">{{ s.correctAnswers }} / {{ s.correctAnswers + s.incorrectAnswers }}</span>
                <span class="metric-label">Aciertos</span>
              </div>
            </div>

            <div class="metric-card metric--danger">
              <span class="metric-icon">❌</span>
              <div class="metric-info">
                <span class="metric-value">{{ s.incorrectAnswers }} / {{ s.correctAnswers + s.incorrectAnswers }}</span>
                <span class="metric-label">Errores</span>
              </div>
            </div>

            <div class="metric-card metric--precision">
              <span class="metric-icon">🎯</span>
              <div class="metric-info">
                <span class="metric-value">{{ s.accuracyPercentage | number:'1.0-1' }}%</span>
                <span class="metric-label">Precisión</span>
              </div>
            </div>

            <div class="metric-card metric--streak">
              <span class="metric-icon">🔥</span>
              <div class="metric-info">
                <span class="metric-value">x{{ s.maxStreak }}</span>
                <span class="metric-label">Racha Máxima</span>
              </div>
            </div>

            <div class="metric-card metric--time">
              <span class="metric-icon">⏱️</span>
              <div class="metric-info">
                <span class="metric-value">{{ s.totalDurationSeconds }}s</span>
                <span class="metric-label">Tiempo Total</span>
              </div>
            </div>

            @if (s.leaderboardUpdate; as lb) {
              <div class="metric-card metric--rank">
                <span class="metric-icon">🏅</span>
                <div class="metric-info">
                  <span class="metric-value">#{{ lb.globalRank }}</span>
                  <span class="metric-label">Rango Global</span>
                </div>
              </div>
            }
          </div>

          <!-- ACTION BUTTONS -->
          <div class="results-actions">
            <button type="button" class="btn-action btn-play-again" (click)="playAgain()">
              <span>🔄 Jugar de Nuevo</span>
            </button>

            <a routerLink="/" class="btn-action btn-secondary">
              <span>📂 Cambiar Categoría</span>
            </a>

            <a routerLink="/leaderboard" class="btn-action btn-secondary">
              <span>🏆 Ver Leaderboard</span>
            </a>
          </div>
        </div>
      } @else {
        <div class="empty-results">
          <p>No se encontraron resultados para esta partida.</p>
          <a routerLink="/" class="btn-action btn-play-again">Ir al Dashboard</a>
        </div>
      }
    </main>
  `,
  styles: [`
    .results-container {
      max-width: 780px;
      margin: 0 auto;
      padding: var(--space-8) var(--space-4) var(--space-16);
      display: flex;
      justify-content: center;
    }

    .results-card {
      width: 100%;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-elevation-high);
      display: flex;
      flex-direction: column;
      gap: var(--space-6);
      animation: bounce-in 300ms ease-out;
    }

    @media (max-width: 600px) {
      .results-card {
        padding: var(--space-5);
      }
    }

    .results-header {
      text-align: center;
    }

    .celebration-badge {
      display: inline-block;
      font-size: 13px;
      font-weight: 800;
      color: var(--accent-gold);
      letter-spacing: 0.08em;
      margin-bottom: var(--space-2);
    }

    .results-title {
      font-family: var(--font-display);
      font-size: 28px;
      font-weight: 800;
      color: var(--text-primary);
    }

    /* SCORE DISPLAY */
    .score-display {
      background: linear-gradient(180deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.08));
      border: 1px solid rgba(99, 102, 241, 0.3);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 4px;
    }

    .score-label {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--text-secondary);
    }

    .score-value {
      font-family: var(--font-display);
      font-size: 52px;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
      letter-spacing: -0.02em;
      text-shadow: 0 0 20px rgba(99, 102, 241, 0.5);
    }

    .score-unit {
      font-family: var(--font-mono);
      font-size: 14px;
      font-weight: 700;
      color: var(--accent-cyan);
    }

    .record-badge {
      margin-top: var(--space-3);
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid var(--accent-gold);
      color: #FDE047;
      font-weight: 700;
      font-size: 13px;
      padding: 4px 14px;
      border-radius: var(--radius-full);
      animation: flame-glow 2s infinite ease-in-out;
    }

    /* METRICS GRID */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: var(--space-3);
    }

    @media (max-width: 640px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    .metric-card {
      background: var(--surface-elevated);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      padding: var(--space-4);
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .metric-icon {
      font-size: 24px;
    }

    .metric-info {
      display: flex;
      flex-direction: column;
    }

    .metric-value {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .metric-label {
      font-size: 11px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* ACTIONS */
    .results-actions {
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
      margin-top: var(--space-2);
    }

    @media (min-width: 640px) {
      .results-actions {
        flex-direction: row;
      }
    }

    .btn-action {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 14px 20px;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      transition: all var(--transition-fast);
      text-align: center;
    }

    .btn-play-again {
      background: var(--brand-primary-500);
      color: #FFFFFF;
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
    }

    .btn-play-again:hover {
      background: var(--brand-primary-600);
      transform: translateY(-2px);
    }

    .btn-secondary {
      background: var(--surface-elevated);
      border: 1px solid var(--surface-border);
      color: var(--text-primary);
    }

    .btn-secondary:hover {
      background: var(--neutral-800);
      border-color: var(--accent-cyan);
      transform: translateY(-2px);
    }

    .empty-results {
      text-align: center;
      padding: var(--space-16);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      color: var(--text-secondary);
    }
  `]
})
export class GameResultsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly gameService = inject(GameService);

  readonly summary = signal<GameSummary | null>(null);

  ngOnInit(): void {
    const s = this.gameService.currentSummary();
    if (s) {
      this.summary.set(s);
    } else {
      // Mock summary or fallback if accessed directly
      const idParam = this.route.snapshot.paramMap.get('id');
      const gameId = idParam ? parseInt(idParam, 10) : 0;
      this.summary.set({
        gameId,
        status: 'COMPLETED',
        finalScore: this.gameService.currentScore() || 2400,
        correctAnswers: 7,
        incorrectAnswers: 3,
        maxStreak: this.gameService.currentStreak() || 4,
        totalDurationSeconds: 95,
        accuracyPercentage: 70.0,
        completedAt: new Date().toISOString(),
        leaderboardUpdate: {
          globalRank: 12,
          weeklyRank: 4,
          isPersonalBest: true
        }
      });
    }
  }

  playAgain(): void {
    this.gameService.startGame({
      gameMode: 'QUICK_PLAY',
      categoryId: null
    }).subscribe({
      next: (game) => {
        this.router.navigate(['/game', game.gameId]);
      },
      error: () => {
        this.router.navigate(['/']);
      }
    });
  }
}
