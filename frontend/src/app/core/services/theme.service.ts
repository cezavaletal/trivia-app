import { Injectable, signal, effect } from '@angular/core';

export type Theme = 'dark' | 'light';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly STORAGE_KEY = 'trivia_theme';
  
  readonly theme = signal<Theme>(this.getInitialTheme());

  constructor() {
    effect(() => {
      const current = this.theme();
      localStorage.setItem(this.STORAGE_KEY, current);
      if (typeof document !== 'undefined') {
        document.documentElement.setAttribute('data-theme', current);
        if (current === 'light') {
          document.documentElement.classList.add('theme-light');
        } else {
          document.documentElement.classList.remove('theme-light');
        }
      }
    });
  }

  toggleTheme(): void {
    this.theme.update(t => t === 'dark' ? 'light' : 'dark');
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
  }

  private getInitialTheme(): Theme {
    if (typeof localStorage !== 'undefined') {
      const saved = localStorage.getItem(this.STORAGE_KEY) as Theme;
      if (saved === 'dark' || saved === 'light') {
        return saved;
      }
    }
    return 'dark';
  }
}
