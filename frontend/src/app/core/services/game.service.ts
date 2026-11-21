import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  GameStartedResponse,
  GameStateResponse,
  GameSummary,
  StartGameRequest,
  SubmitAnswerRequest,
  SubmitAnswerResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  private readonly http = inject(HttpClient);

  readonly activeGame = signal<GameStartedResponse | null>(null);
  readonly currentSummary = signal<GameSummary | null>(null);
  readonly currentScore = signal<number>(0);
  readonly currentStreak = signal<number>(0);

  startGame(request: StartGameRequest): Observable<GameStartedResponse> {
    return this.http.post<GameStartedResponse>(`${environment.apiUrl}/games`, request).pipe(
      tap(game => {
        this.activeGame.set(game);
        this.currentScore.set(game.totalScore);
        this.currentStreak.set(game.currentStreak);
        this.currentSummary.set(null);
      })
    );
  }

  getGameState(gameId: number): Observable<GameStateResponse> {
    return this.http.get<GameStateResponse>(`${environment.apiUrl}/games/${gameId}`);
  }

  submitAnswer(gameId: number, answer: SubmitAnswerRequest): Observable<SubmitAnswerResponse> {
    return this.http.post<SubmitAnswerResponse>(`${environment.apiUrl}/games/${gameId}/answers`, answer).pipe(
      tap(response => {
        this.currentScore.set(response.gameProgress.totalScore);
        this.currentStreak.set(response.gameProgress.currentStreak);
      })
    );
  }

  finishGame(gameId: number): Observable<GameSummary> {
    return this.http.post<GameSummary>(`${environment.apiUrl}/games/${gameId}/finish`, {}).pipe(
      tap(summary => {
        this.currentSummary.set(summary);
        this.activeGame.set(null);
      })
    );
  }

  resetGame(): void {
    this.activeGame.set(null);
    this.currentSummary.set(null);
    this.currentScore.set(0);
    this.currentStreak.set(0);
  }
}
