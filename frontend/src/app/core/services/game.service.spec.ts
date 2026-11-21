import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { GameService } from './game.service';
import { environment } from '../../../environments/environment';
import { GameStartedResponse, GameSummary, SubmitAnswerResponse } from '../models';

describe('GameService', () => {
  let service: GameService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        GameService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });

    service = TestBed.inject(GameService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crearse e inicializar signals en 0 / null', () => {
    expect(service).toBeTruthy();
    expect(service.activeGame()).toBeNull();
    expect(service.currentSummary()).toBeNull();
    expect(service.currentScore()).toBe(0);
    expect(service.currentStreak()).toBe(0);
  });

  it('startGame() debe realizar POST y actualizar signals de partida activa, score y racha', () => {
    const mockStarted: GameStartedResponse = {
      gameId: 101,
      gameMode: 'QUICK_PLAY',
      status: 'IN_PROGRESS',
      totalQuestions: 10,
      totalScore: 0,
      currentStreak: 0,
      createdAt: '2026-11-20T10:00:00Z',
      questions: [
        {
          id: 501,
          order: 1,
          categoryName: 'Ciencia',
          difficulty: 'MEDIUM',
          timeLimitSeconds: 15,
          text: '¿Pregunta 1?',
          options: [
            { id: 1, text: 'A' },
            { id: 2, text: 'B' }
          ]
        }
      ]
    };

    service.startGame({ gameMode: 'QUICK_PLAY' }).subscribe(game => {
      expect(game.gameId).toBe(101);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/games`);
    expect(req.request.method).toBe('POST');
    req.flush(mockStarted);

    expect(service.activeGame()).toEqual(mockStarted);
    expect(service.currentScore()).toBe(0);
    expect(service.currentStreak()).toBe(0);
  });

  it('submitAnswer() debe actualizar signals currentScore y currentStreak', () => {
    const mockAnswerResponse: SubmitAnswerResponse = {
      questionId: 501,
      isCorrect: true,
      correctOptionId: 2,
      explanation: 'Explicación de prueba',
      scoreCalculation: {
        baseScore: 200,
        speedBonus: 50,
        currentStreak: 2,
        streakMultiplier: 1.2,
        pointsAwarded: 300
      },
      gameProgress: {
        totalScore: 300,
        currentStreak: 2,
        remainingQuestions: 9
      }
    };

    service.submitAnswer(101, { questionId: 501, selectedOptionId: 2, clientDurationMs: 4000 })
      .subscribe(res => {
        expect(res.isCorrect).toBeTrue();
      });

    const req = httpMock.expectOne(`${environment.apiUrl}/games/101/answers`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAnswerResponse);

    expect(service.currentScore()).toBe(300);
    expect(service.currentStreak()).toBe(2);
  });

  it('finishGame() debe registrar resumen en signal currentSummary y limpiar activeGame', () => {
    const mockSummary: GameSummary = {
      gameId: 101,
      status: 'COMPLETED',
      finalScore: 2800,
      correctAnswers: 8,
      incorrectAnswers: 2,
      maxStreak: 5,
      totalDurationSeconds: 110,
      accuracyPercentage: 80.0,
      completedAt: '2026-11-20T10:05:00Z',
      leaderboardUpdate: {
        globalRank: 12,
        weeklyRank: 4,
        isPersonalBest: true
      }
    };

    service.finishGame(101).subscribe(summary => {
      expect(summary.finalScore).toBe(2800);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/games/101/finish`);
    expect(req.request.method).toBe('POST');
    req.flush(mockSummary);

    expect(service.currentSummary()).toEqual(mockSummary);
    expect(service.activeGame()).toBeNull();
  });

  it('resetGame() debe reiniciar todos los signals a estado inicial', () => {
    service.currentScore.set(1500);
    service.currentStreak.set(4);

    service.resetGame();

    expect(service.activeGame()).toBeNull();
    expect(service.currentSummary()).toBeNull();
    expect(service.currentScore()).toBe(0);
    expect(service.currentStreak()).toBe(0);
  });
});
