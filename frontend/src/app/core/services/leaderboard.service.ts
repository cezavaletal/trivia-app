import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  LeaderboardCategoryResponse,
  LeaderboardGlobalResponse,
  LeaderboardWeeklyResponse
} from '../models';

@Injectable({
  providedIn: 'root'
})
export class LeaderboardService {
  private readonly http = inject(HttpClient);

  getGlobal(page = 0, size = 20): Observable<LeaderboardGlobalResponse> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<LeaderboardGlobalResponse>(`${environment.apiUrl}/leaderboard/global`, { params });
  }

  getWeekly(page = 0, size = 20): Observable<LeaderboardWeeklyResponse> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<LeaderboardWeeklyResponse>(`${environment.apiUrl}/leaderboard/weekly`, { params });
  }

  getByCategory(categoryId: number, page = 0, size = 20): Observable<LeaderboardCategoryResponse> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<LeaderboardCategoryResponse>(`${environment.apiUrl}/leaderboard/category/${categoryId}`, { params });
  }
}
