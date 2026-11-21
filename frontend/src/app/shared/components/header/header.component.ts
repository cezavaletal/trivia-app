import { Component, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { ThemeService } from '../../../core/services/theme.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  template: `
    <header class="app-header" [class.header--game]="isGameMode()">
      <div class="header-container">
        <!-- Brand Logo -->
        <a routerLink="/" class="brand-logo" aria-label="Ir al inicio">
          <span class="logo-icon">⚡</span>
          <span class="logo-text">TRIVIA <span class="logo-accent">ARENA</span></span>
        </a>

        @if (!isGameMode()) {
          <!-- Navigation -->
          <nav class="nav-links">
            <a routerLink="/" routerLinkActive="nav-active" [routerLinkActiveOptions]="{exact: true}" class="nav-item">
              Inicio
            </a>
            <a routerLink="/leaderboard" routerLinkActive="nav-active" class="nav-item">
              🏆 Clasificación
            </a>
          </nav>
        } @else {
          <div class="game-header-title">
            <span>SALA DE JUEGO</span>
          </div>
        }

        <!-- Actions & Profile -->
        <div class="header-actions">
          <!-- Theme Toggle Button -->
          <button 
            type="button" 
            class="action-btn theme-toggle" 
            (click)="themeService.toggleTheme()" 
            [attr.aria-label]="themeService.theme() === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'"
            title="Alternar tema"
          >
            {{ themeService.theme() === 'dark' ? '☀️' : '🌙' }}
          </button>

          @if (authService.isAuthenticated()) {
            @if (!isGameMode() && authService.currentUser(); as user) {
              <div class="user-stats-pill">
                @if (user.stats?.bestStreak; as streak) {
                  <span class="pill-item streak-pill" title="Mejor Racha">
                    🔥 {{ streak }}
                  </span>
                }
                @if (user.stats?.highestScore; as score) {
                  <span class="pill-item score-pill" title="Puntuación Máxima">
                    ⭐ {{ score | number }}
                  </span>
                }
              </div>

              <div class="user-menu">
                <span class="user-avatar">👤</span>
                <span class="username">{{ user.username }}</span>
                <button type="button" class="logout-btn" (click)="authService.logout()" title="Cerrar sesión">
                  Salir
                </button>
              </div>
            } @else if (isGameMode()) {
              <button type="button" class="quit-btn" (click)="quitGame()">
                ✕ Salir de Partida
              </button>
            }
          } @else {
            <div class="auth-buttons">
              <a routerLink="/login" class="btn-login">Ingresar</a>
              <a routerLink="/register" class="btn-register">Registrarse</a>
            </div>
          }
        </div>
      </div>
    </header>
  `,
  styles: [`
    .app-header {
      background-color: var(--surface-card);
      border-bottom: 1px solid var(--surface-border);
      position: sticky;
      top: 0;
      z-index: 100;
      backdrop-filter: blur(12px);
      transition: all var(--transition-fast);
    }

    .header-container {
      max-width: 1200px;
      margin: 0 auto;
      padding: var(--space-3) var(--space-6);
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
    }

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 8px;
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: var(--text-primary);
    }

    .logo-icon {
      font-size: 22px;
      filter: drop-shadow(0 0 8px rgba(99, 102, 241, 0.6));
    }

    .logo-accent {
      color: var(--brand-primary-400);
    }

    .nav-links {
      display: flex;
      gap: var(--space-2);
    }

    @media (max-width: 768px) {
      .nav-links {
        display: none;
      }
    }

    .nav-item {
      padding: 6px 14px;
      border-radius: var(--radius-md);
      font-size: 14px;
      font-weight: 600;
      color: var(--text-secondary);
      transition: all var(--transition-fast);
    }

    .nav-item:hover {
      color: var(--text-primary);
      background: var(--surface-elevated);
    }

    .nav-active {
      color: var(--accent-cyan) !important;
      background: rgba(6, 182, 212, 0.12) !important;
    }

    .game-header-title {
      font-family: var(--font-display);
      font-size: 15px;
      font-weight: 700;
      letter-spacing: 0.1em;
      color: var(--accent-cyan);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: var(--space-3);
    }

    .action-btn {
      width: 38px;
      height: 38px;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-elevated);
      border: 1px solid var(--surface-border);
      font-size: 18px;
      color: var(--text-primary);
      transition: all var(--transition-fast);
    }

    .action-btn:hover {
      border-color: var(--brand-primary-400);
      transform: scale(1.05);
    }

    .user-stats-pill {
      display: flex;
      align-items: center;
      gap: 8px;
      background: var(--surface-elevated);
      padding: 4px 12px;
      border-radius: var(--radius-full);
      border: 1px solid var(--surface-border);
      font-family: var(--font-mono);
      font-size: 13px;
      font-weight: 700;
    }

    @media (max-width: 640px) {
      .user-stats-pill {
        display: none;
      }
    }

    .streak-pill {
      color: var(--accent-gold);
    }

    .score-pill {
      color: var(--accent-cyan);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .user-avatar {
      font-size: 18px;
    }

    .username {
      font-size: 14px;
      font-weight: 600;
      color: var(--text-primary);
    }

    .logout-btn {
      font-size: 12px;
      padding: 4px 10px;
      border-radius: var(--radius-sm);
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .logout-btn:hover {
      background: var(--game-danger);
      color: #FFFFFF;
    }

    .quit-btn {
      font-size: 13px;
      padding: 6px 14px;
      border-radius: var(--radius-md);
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #F87171;
      font-weight: 700;
      transition: all var(--transition-fast);
    }

    .quit-btn:hover {
      background: var(--game-danger);
      color: #FFFFFF;
    }

    .auth-buttons {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .btn-login {
      padding: 6px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      border: 1px solid var(--surface-border);
    }

    .btn-login:hover {
      color: var(--text-primary);
      background: var(--surface-elevated);
    }

    .btn-register {
      padding: 6px 16px;
      border-radius: var(--radius-md);
      font-size: 13px;
      font-weight: 600;
      background: var(--brand-primary-500);
      color: #FFFFFF;
      box-shadow: 0 0 10px rgba(99, 102, 241, 0.4);
    }

    .btn-register:hover {
      background: var(--brand-primary-600);
    }
  `]
})
export class HeaderComponent {
  readonly authService = inject(AuthService);
  readonly themeService = inject(ThemeService);
  private readonly router = inject(Router);

  readonly isGameMode = input<boolean>(false);

  quitGame(): void {
    if (confirm('¿Seguro que deseas salir de la partida actual? Perderás tu racha.')) {
      this.router.navigate(['/']);
    }
  }
}
