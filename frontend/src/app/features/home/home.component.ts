import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CategoryService } from '../../core/services/category.service';
import { GameService } from '../../core/services/game.service';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { CategoryCardComponent } from '../../shared/components/category-card/category-card.component';
import { Category } from '../../core/models';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeaderComponent, CategoryCardComponent],
  template: `
    <app-header />
    <main class="dashboard-container">
      <!-- HERO BANNER -->
      <section class="hero-banner">
        <div class="hero-content">
          <div class="hero-tag">🔥 TEMPORADA COMPETITIVA ACTIVA</div>
          <h1 class="hero-title">
            Domina el Conocimiento, <br class="hero-br">
            <span class="gradient-text">Conquista la Trivia</span>
          </h1>
          <p class="hero-description">
            Pon a prueba tu agilidad mental con 10 preguntas cronometradas por partida.
            Mantén la racha para multiplicar tus puntos y alcanzar la cima del ranking mundial.
          </p>

          <div class="hero-actions">
            <button 
              type="button" 
              class="btn-quick-play" 
              [disabled]="startingGame()" 
              (click)="startQuickPlay()"
            >
              @if (startingGame()) {
                <span class="spinner"></span>
                <span>Iniciando Partida...</span>
              } @else {
                <span class="play-icon">▶</span>
                <span>PARTIDA RÁPIDA (Mix)</span>
              }
            </button>

            <a routerLink="/leaderboard" class="btn-leaderboard">
              <span class="trophy-icon">🏆</span>
              <span>Ver Ranking Semanal</span>
            </a>
          </div>
        </div>
      </section>

      <!-- STATS BAR (Usuario Autenticado) -->
      @if (authService.currentUser(); as user) {
        <section class="stats-section">
          <h2 class="section-title">Mis Estadísticas</h2>
          <div class="stats-grid">
            <div class="stat-card">
              <span class="stat-icon">🎮</span>
              <div class="stat-info">
                <span class="stat-value">{{ user.stats?.gamesPlayed ?? 0 }}</span>
                <span class="stat-label">Partidas Jugadas</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">🎯</span>
              <div class="stat-info">
                <span class="stat-value">{{ calculateAccuracy(user) }}%</span>
                <span class="stat-label">Precisión de Aciertos</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">🔥</span>
              <div class="stat-info">
                <span class="stat-value">{{ user.stats?.bestStreak ?? 0 }}</span>
                <span class="stat-label">Mejor Racha</span>
              </div>
            </div>

            <div class="stat-card">
              <span class="stat-icon">⭐</span>
              <div class="stat-info">
                <span class="stat-value">{{ user.stats?.highestScore ?? 0 | number }}</span>
                <span class="stat-label">Puntaje Máximo</span>
              </div>
            </div>
          </div>
        </section>
      }

      <!-- CATEGORIES SECTION -->
      <section class="categories-section">
        <div class="categories-header">
          <div>
            <h2 class="section-title">Explora por Categorías</h2>
            <p class="section-subtitle">Elige tu especialidad y demuestra quién sabe más</p>
          </div>
        </div>

        @if (categoryService.loading()) {
          <div class="loading-state">
            <div class="spinner-large"></div>
            <p>Cargando categorías temáticas...</p>
          </div>
        } @else if (categories().length === 0) {
          <div class="empty-state">
            <span class="empty-icon">📂</span>
            <h3>No hay categorías disponibles</h3>
            <p>Vuelve más tarde o inicia una partida rápida aleatoria.</p>
          </div>
        } @else {
          <div class="categories-grid">
            @for (cat of categories(); track cat.id) {
              <app-category-card 
                [category]="cat" 
                (onSelect)="startCategoryPlay($event)"
              />
            }
          </div>
        }
      </section>
    </main>
  `,
  styles: [`
    .dashboard-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-6) var(--space-6) var(--space-16);
      display: flex;
      flex-direction: column;
      gap: var(--space-8);
    }

    /* HERO BANNER */
    .hero-banner {
      background: linear-gradient(135deg, rgba(99, 102, 241, 0.15), rgba(6, 182, 212, 0.1));
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-xl);
      padding: var(--space-10) var(--space-8);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-elevation-mid);
    }

    @media (max-width: 640px) {
      .hero-banner {
        padding: var(--space-6) var(--space-4);
      }
    }

    .hero-tag {
      display: inline-block;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.08em;
      color: var(--accent-gold);
      background: rgba(245, 158, 11, 0.15);
      border: 1px solid rgba(245, 158, 11, 0.3);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      margin-bottom: var(--space-3);
    }

    .hero-title {
      font-family: var(--font-display);
      font-size: 40px;
      font-weight: 800;
      line-height: 1.15;
      letter-spacing: -0.02em;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
    }

    @media (max-width: 640px) {
      .hero-title {
        font-size: 28px;
      }
      .hero-br {
        display: none;
      }
    }

    .gradient-text {
      background: linear-gradient(90deg, var(--brand-primary-400), var(--brand-accent-cyan));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }

    .hero-description {
      font-size: 16px;
      color: var(--text-secondary);
      max-width: 680px;
      line-height: 1.5;
      margin-bottom: var(--space-6);
    }

    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      gap: var(--space-4);
    }

    .btn-quick-play {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 28px;
      border-radius: var(--radius-lg);
      background: var(--brand-primary-500);
      color: #FFFFFF;
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 800;
      box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
      transition: all var(--transition-fast);
    }

    .btn-quick-play:hover:not(:disabled) {
      background: var(--brand-primary-600);
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(99, 102, 241, 0.6);
    }

    .btn-quick-play:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .btn-leaderboard {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 16px 24px;
      border-radius: var(--radius-lg);
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      color: var(--text-primary);
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      transition: all var(--transition-fast);
    }

    .btn-leaderboard:hover {
      background: var(--surface-elevated);
      border-color: var(--accent-gold);
      transform: translateY(-2px);
    }

    .play-icon, .trophy-icon {
      font-size: 18px;
    }

    /* STATS SECTION */
    .section-title {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: var(--space-3);
    }

    .section-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      margin-top: -6px;
      margin-bottom: var(--space-4);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: var(--space-4);
    }

    .stat-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      align-items: center;
      gap: var(--space-4);
      box-shadow: var(--shadow-elevation-low);
    }

    .stat-icon {
      font-size: 32px;
      line-height: 1;
    }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-family: var(--font-mono);
      font-size: 24px;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1.1;
    }

    .stat-label {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      margin-top: 2px;
    }

    /* CATEGORIES GRID */
    .categories-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
      gap: var(--space-5);
    }

    .loading-state, .empty-state {
      text-align: center;
      padding: var(--space-12) var(--space-4);
      background: var(--surface-card);
      border: 1px dashed var(--surface-border);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
      color: var(--text-secondary);
    }

    .empty-icon {
      font-size: 40px;
    }

    .spinner, .spinner-large {
      border: 3px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: currentColor;
      animation: spin 600ms linear infinite;
    }

    .spinner {
      width: 16px;
      height: 16px;
    }

    .spinner-large {
      width: 36px;
      height: 36px;
      border-color: rgba(99, 102, 241, 0.2);
      border-top-color: var(--brand-primary-500);
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class HomeComponent implements OnInit {
  readonly authService = inject(AuthService);
  readonly categoryService = inject(CategoryService);
  readonly gameService = inject(GameService);
  private readonly router = inject(Router);

  readonly categories = this.categoryService.categories;
  readonly startingGame = signal<boolean>(false);

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe();
  }

  calculateAccuracy(user: any): number {
    const totalAnswers = user.stats?.gamesPlayed ? user.stats.gamesPlayed * 10 : 0;
    if (totalAnswers === 0) return 0;
    const correct = user.stats?.totalCorrectAnswers ?? 0;
    return Math.round((correct / totalAnswers) * 100);
  }

  startQuickPlay(): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    this.startingGame.set(true);
    this.gameService.startGame({
      gameMode: 'QUICK_PLAY',
      categoryId: null
    }).subscribe({
      next: (game) => {
        this.startingGame.set(false);
        this.router.navigate(['/game', game.gameId]);
      },
      error: (err) => {
        this.startingGame.set(false);
        alert(err.error?.message || 'Error al iniciar partida rápida.');
      }
    });
  }

  startCategoryPlay(categoryId: number): void {
    if (!this.authService.isAuthenticated()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/' } });
      return;
    }

    this.startingGame.set(true);
    this.gameService.startGame({
      gameMode: 'CATEGORY',
      categoryId: categoryId
    }).subscribe({
      next: (game) => {
        this.startingGame.set(false);
        this.router.navigate(['/game', game.gameId]);
      },
      error: (err) => {
        this.startingGame.set(false);
        alert(err.error?.message || 'Error al iniciar partida de categoría.');
      }
    });
  }
}
