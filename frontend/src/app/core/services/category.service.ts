import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Category } from '../models';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private readonly http = inject(HttpClient);
  
  readonly categories = signal<Category[]>([]);
  readonly loading = signal<boolean>(false);

  getCategories(): Observable<Category[]> {
    this.loading.set(true);
    return this.http.get<Category[]>(`${environment.apiUrl}/categories`).pipe(
      tap({
        next: (cats) => {
          this.categories.set(cats);
          this.loading.set(false);
        },
        error: () => this.loading.set(false)
      })
    );
  }
}
