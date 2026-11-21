import { Component, inject, OnInit, OnDestroy, HostListener, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { GameService } from '../../core/services/game.service';
import { QuestionPublic, AnswerOptionPublic, SubmitAnswerResponse } from '../../core/models';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { QuestionCardComponent } from '../../shared/components/question-card/question-card.component';
import { TimerBarComponent } from '../../shared/components/timer-bar/timer-bar.component';
import { AnswerButtonComponent, AnswerState } from '../../shared/components/answer-button/answer-button.component';
import { StreakBadgeComponent } from '../../shared/components/streak-badge/streak-badge.component';
import { ProgressBarComponent } from '../../shared/components/progress-bar/progress-bar.component';

@Component({
  selector: 'app-game-arena',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    QuestionCardComponent,
    TimerBarComponent,
    AnswerButtonComponent,
    StreakBadgeComponent,
    ProgressBarComponent
  ],
  template: `
    <app-header [isGameMode]="true" />
    
    <main class="arena-container">
      @if (loading()) {
        <div class="arena-loading">
          <div class="spinner-large"></div>
          <p>Cargando sala de juego...</p>
        </div>
      } @else {
        @if (currentQuestion(); as q) {
          <!-- TOP HUD -->
          <div class="arena-hud">
            <div class="hud-item hud-progress-info">
              <span class="hud-label">PREGUNTA</span>
              <span class="hud-value">{{ currentIndex() + 1 }} / {{ totalQuestions() }}</span>
            </div>

            <div class="hud-item hud-score">
              <span class="hud-label">PUNTAJE</span>
              <span class="hud-value hud-value--score">{{ totalScore() | number }} PTS</span>
            </div>

            <div class="hud-item hud-streak">
              <app-streak-badge [streak]="currentStreak()" [multiplier]="currentMultiplier()" />
            </div>
          </div>

          <!-- PROGRESS BAR -->
          <div class="arena-progress">
            <app-progress-bar 
              [current]="currentIndex() + 1" 
              [total]="totalQuestions()" 
              [showLabel]="false"
            />
          </div>

          <!-- COUNTDOWN TIMER -->
          <div class="arena-timer">
            <app-timer-bar 
              [totalSeconds]="timeLimit()" 
              [remainingSeconds]="remainingTime()"
              [isPaused]="isAnswering()"
            />
          </div>

          <!-- QUESTION CARD -->
          <div class="arena-question">
            <app-question-card 
              [questionText]="q.text"
              [categoryName]="q.categoryName"
              [difficulty]="q.difficulty"
            />
          </div>

          <!-- ANSWER FEEDBACK BANNER (IF ANSWERED) -->
          @if (feedback(); as fb) {
            <div 
              class="feedback-banner"
              [class.feedback--correct]="fb.isCorrect"
              [class.feedback--incorrect]="!fb.isCorrect"
            >
              <div class="feedback-header">
                <span class="feedback-badge">{{ fb.isCorrect ? '¡CORRECTO! +' + fb.scoreCalculation.pointsAwarded + ' PTS' : '¡FALLASTE!' }}</span>
                @if (fb.scoreCalculation.speedBonus > 0) {
                  <span class="speed-bonus-tag">⚡ Bono velocidad: +{{ fb.scoreCalculation.speedBonus }}</span>
                }
              </div>
              @if (fb.explanation) {
                <p class="feedback-explanation">{{ fb.explanation }}</p>
              }
            </div>
          }

          <!-- ANSWER BUTTONS GRID (4 OPCIONES) -->
          <div class="answers-grid" role="group" aria-label="Opciones de respuesta">
            @for (option of q.options; track option.id; let idx = $index) {
              <app-answer-button
                [keyIndex]="getKeyLabel(idx)"
                [answerText]="option.text"
                [state]="getOptionState(option.id)"
                [disabled]="isAnswering()"
                (onAnswerSelect)="selectOption(option.id)"
              />
            }
          </div>

          <!-- KEYBOARD HELP BAR -->
          <div class="keyboard-tips" aria-hidden="true">
            <span>Atajos de teclado:</span>
            <span class="key-shortcut">[1] - [4]</span>
            <span>o</span>
            <span class="key-shortcut">[A] - [D]</span>
          </div>
        } @else {
          <div class="arena-error">
            <p>No se encontró la partida activa.</p>
            <button type="button" class="btn-return" (click)="goHome()">Volver al Inicio</button>
          </div>
        }
      }
    </main>
  `,
  styles: [`
    .arena-container {
      max-width: 860px;
      margin: 0 auto;
      padding: var(--space-4) var(--space-4) var(--space-12);
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
      min-height: calc(100vh - 65px);
    }

    .arena-loading, .arena-error {
      text-align: center;
      padding: var(--space-16) 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
      color: var(--text-secondary);
    }

    .spinner-large {
      width: 48px;
      height: 48px;
      border: 4px solid rgba(99, 102, 241, 0.2);
      border-top-color: var(--brand-primary-500);
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* TOP HUD */
    .arena-hud {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: var(--space-4);
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-lg);
      padding: var(--space-3) var(--space-6);
      box-shadow: var(--shadow-elevation-low);
    }

    @media (max-width: 600px) {
      .arena-hud {
        padding: var(--space-3);
      }
    }

    .hud-item {
      display: flex;
      flex-direction: column;
    }

    .hud-label {
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 0.06em;
      color: var(--text-muted);
    }

    .hud-value {
      font-family: var(--font-mono);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
    }

    .hud-value--score {
      color: var(--accent-cyan);
    }

    .arena-progress {
      width: 100%;
    }

    .arena-timer {
      padding: var(--space-2) 0;
    }

    .arena-question {
      width: 100%;
    }

    /* FEEDBACK BANNER */
    .feedback-banner {
      padding: var(--space-4) var(--space-5);
      border-radius: var(--radius-lg);
      animation: bounce-in 250ms ease-out;
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .feedback--correct {
      background: rgba(16, 185, 129, 0.15);
      border: 2px solid var(--game-success);
      color: #ECFDF5;
    }

    .feedback--incorrect {
      background: rgba(239, 68, 68, 0.15);
      border: 2px solid var(--game-danger);
      color: #FEF2F2;
    }

    .feedback-header {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .feedback-badge {
      font-family: var(--font-display);
      font-weight: 800;
      font-size: 16px;
      letter-spacing: 0.04em;
    }

    .speed-bonus-tag {
      font-size: 12px;
      font-weight: 700;
      background: rgba(245, 158, 11, 0.2);
      border: 1px solid rgba(245, 158, 11, 0.4);
      color: #FBBF24;
      padding: 2px 8px;
      border-radius: var(--radius-sm);
    }

    .feedback-explanation {
      font-size: 14px;
      line-height: 1.4;
      opacity: 0.95;
    }

    /* ANSWERS GRID */
    .answers-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: var(--space-4);
    }

    @media (max-width: 640px) {
      .answers-grid {
        grid-template-columns: 1fr;
        gap: var(--space-3);
      }
    }

    .keyboard-tips {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-size: 12px;
      color: var(--text-muted);
      margin-top: var(--space-2);
    }

    .key-shortcut {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      padding: 2px 6px;
      border-radius: var(--radius-sm);
      font-family: var(--font-mono);
      font-weight: 700;
      color: var(--text-secondary);
    }

    .btn-return {
      padding: 10px 20px;
      border-radius: var(--radius-md);
      background: var(--brand-primary-500);
      color: #FFF;
      font-weight: 700;
    }
  `]
})
export class GameArenaComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  readonly gameService = inject(GameService);

  readonly loading = signal<boolean>(true);
  readonly gameId = signal<number>(0);
  readonly questions = signal<QuestionPublic[]>([]);
  readonly currentIndex = signal<number>(0);

  readonly totalScore = this.gameService.currentScore;
  readonly currentStreak = this.gameService.currentStreak;

  // Question state
  readonly timeLimit = signal<number>(15);
  readonly remainingTime = signal<number>(15);
  readonly isAnswering = signal<boolean>(false);
  readonly selectedOptionId = signal<number | null>(null);
  readonly feedback = signal<SubmitAnswerResponse | null>(null);

  private timerInterval: any = null;
  private questionStartTime: number = 0;

  readonly currentQuestion = computed(() => {
    const list = this.questions();
    const idx = this.currentIndex();
    return list[idx] || null;
  });

  readonly totalQuestions = computed(() => this.questions().length || 10);

  readonly currentMultiplier = computed(() => {
    const streak = this.currentStreak();
    if (streak >= 5) return 2.0;
    if (streak >= 3) return 1.5;
    if (streak >= 1) return 1.2;
    return 1.0;
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? parseInt(idParam, 10) : 0;
    this.gameId.set(id);

    const active = this.gameService.activeGame();
    if (active && active.gameId === id) {
      this.questions.set(active.questions);
      this.loading.set(false);
      this.startCurrentQuestion();
    } else {
      // If refreshed or navigated directly, fetch game state
      this.gameService.getGameState(id).subscribe({
        next: (state) => {
          // If we don't have full questions, game must be started properly
          if (!this.gameService.activeGame()?.questions?.length) {
            this.router.navigate(['/']);
            return;
          }
          this.loading.set(false);
          this.startCurrentQuestion();
        },
        error: () => {
          this.loading.set(false);
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if (this.isAnswering() || this.loading()) return;
    const q = this.currentQuestion();
    if (!q || !q.options) return;

    let targetIndex = -1;
    const key = event.key.toLowerCase();
    if (key === '1' || key === 'a') targetIndex = 0;
    else if (key === '2' || key === 'b') targetIndex = 1;
    else if (key === '3' || key === 'c') targetIndex = 2;
    else if (key === '4' || key === 'd') targetIndex = 3;

    if (targetIndex >= 0 && targetIndex < q.options.length) {
      event.preventDefault();
      this.selectOption(q.options[targetIndex].id);
    }
  }

  getKeyLabel(index: number): string {
    const labels = ['A', 'B', 'C', 'D'];
    return labels[index] || `${index + 1}`;
  }

  getOptionState(optionId: number): AnswerState {
    const fb = this.feedback();
    const selId = this.selectedOptionId();

    if (!fb) {
      if (selId === optionId) return 'SELECTED';
      return 'DEFAULT';
    }

    // After feedback:
    if (optionId === fb.correctOptionId) {
      return 'CORRECT';
    }
    if (selId === optionId && !fb.isCorrect) {
      return 'INCORRECT';
    }
    if (selId === null && !fb.isCorrect) {
      return 'TIMEOUT';
    }
    return 'DEFAULT';
  }

  selectOption(optionId: number | null): void {
    if (this.isAnswering()) return;
    this.isAnswering.set(true);
    this.clearTimer();
    this.selectedOptionId.set(optionId);

    const durationMs = Date.now() - this.questionStartTime;
    const q = this.currentQuestion();
    if (!q) return;

    this.gameService.submitAnswer(this.gameId(), {
      questionId: q.id,
      selectedOptionId: optionId,
      clientDurationMs: Math.min(durationMs, 15000)
    }).subscribe({
      next: (response) => {
        this.feedback.set(response);
        // Wait 2.2 seconds to show feedback before moving on
        setTimeout(() => {
          this.advanceToNext();
        }, 2200);
      },
      error: () => {
        // Fallback move to next
        setTimeout(() => {
          this.advanceToNext();
        }, 1500);
      }
    });
  }

  private advanceToNext(): void {
    const nextIdx = this.currentIndex() + 1;
    if (nextIdx < this.questions().length) {
      this.currentIndex.set(nextIdx);
      this.feedback.set(null);
      this.selectedOptionId.set(null);
      this.isAnswering.set(false);
      this.startCurrentQuestion();
    } else {
      // Finish game!
      this.finishMatch();
    }
  }

  private finishMatch(): void {
    this.gameService.finishGame(this.gameId()).subscribe({
      next: (summary) => {
        this.router.navigate(['/game', this.gameId(), 'results']);
      },
      error: () => {
        this.router.navigate(['/game', this.gameId(), 'results']);
      }
    });
  }

  private startCurrentQuestion(): void {
    const q = this.currentQuestion();
    const limit = q?.timeLimitSeconds || 15;
    this.timeLimit.set(limit);
    this.remainingTime.set(limit);
    this.questionStartTime = Date.now();

    this.clearTimer();
    this.timerInterval = setInterval(() => {
      const current = this.remainingTime();
      if (current <= 1) {
        this.remainingTime.set(0);
        this.clearTimer();
        // Trigger timeout auto submit
        this.selectOption(null);
      } else {
        this.remainingTime.set(current - 1);
      }
    }, 1000);
  }

  private clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  goHome(): void {
    this.router.navigate(['/']);
  }
}
