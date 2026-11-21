import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent)
  },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/auth.component').then(m => m.AuthComponent)
  },
  {
    path: 'game/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/game/game-arena.component').then(m => m.GameArenaComponent)
  },
  {
    path: 'game/:id/results',
    canActivate: [authGuard],
    loadComponent: () => import('./features/game/game-results.component').then(m => m.GameResultsComponent)
  },
  {
    path: 'leaderboard',
    loadComponent: () => import('./features/leaderboard/leaderboard.component').then(m => m.LeaderboardComponent)
  },
  {
    path: '**',
    redirectTo: ''
  }
];
