import { Component, input, output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Category } from '../../../core/models';

@Component({
  selector: 'app-category-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div 
      class="cat-card" 
      [class.cat-card--selected]="isSelected()" 
      tabindex="0" 
      role="button"
      [attr.aria-label]="'Categoría ' + category().name + ', ' + category().totalQuestions + ' preguntas'"
      (click)="selectCategory()"
      (keydown.enter)="selectCategory()"
      (keydown.space)="selectCategory()"
    >
      <div class="cat-header">
        <span class="cat-icon">{{ iconGlyph() }}</span>
        <span class="cat-count">{{ category().totalQuestions }} preguntas</span>
      </div>

      <div class="cat-content">
        <h3 class="cat-title">{{ category().name }}</h3>
        <p class="cat-desc">{{ category().description }}</p>
      </div>

      <button type="button" class="cat-play-btn" (click)="selectCategory($event)">
        <span>Jugar Ahora</span>
        <span class="arrow-icon">→</span>
      </button>
    </div>
  `,
  styles: [`
    .cat-card {
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-lg);
      padding: var(--space-5);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      gap: var(--space-4);
      cursor: pointer;
      box-shadow: var(--shadow-elevation-low);
      transition: all var(--transition-fast);
      outline: none;
    }

    .cat-card:hover, .cat-card:focus-visible {
      transform: translateY(-4px);
      border-color: var(--brand-primary-400);
      box-shadow: var(--shadow-elevation-mid), var(--glow-primary);
    }

    .cat-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .cat-icon {
      font-size: 32px;
      line-height: 1;
    }

    .cat-count {
      font-size: 12px;
      font-weight: 600;
      color: var(--text-muted);
      background: var(--surface-elevated);
      padding: 3px 8px;
      border-radius: var(--radius-sm);
      border: 1px solid var(--surface-border);
    }

    .cat-title {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .cat-desc {
      font-size: 13px;
      color: var(--text-secondary);
      line-height: 1.4;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .cat-play-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 14px;
      background: var(--surface-elevated);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      color: var(--accent-cyan);
      font-size: 13px;
      font-weight: 600;
      transition: all var(--transition-fast);
    }

    .cat-card:hover .cat-play-btn {
      background: var(--brand-primary-500);
      border-color: var(--brand-primary-500);
      color: #FFFFFF;
    }

    .arrow-icon {
      transition: transform var(--transition-fast);
    }

    .cat-card:hover .arrow-icon {
      transform: translateX(4px);
    }
  `]
})
export class CategoryCardComponent {
  readonly category = input.required<Category>();
  readonly isSelected = input<boolean>(false);

  readonly onSelect = output<number>();

  readonly iconGlyph = computed(() => {
    const icon = this.category().icon?.toLowerCase() || '';
    if (icon.includes('flask') || icon.includes('science')) return '🔬';
    if (icon.includes('landmark') || icon.includes('history')) return '🏛️';
    if (icon.includes('film') || icon.includes('movie') || icon.includes('cine')) return '🎬';
    if (icon.includes('sports') || icon.includes('ball')) return '⚽';
    if (icon.includes('globe') || icon.includes('geo')) return '🌍';
    if (icon.includes('paint') || icon.includes('art')) return '🎨';
    if (icon.includes('music')) return '🎵';
    if (icon.includes('code') || icon.includes('tech')) return '💻';
    return '⚡';
  });

  selectCategory(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.onSelect.emit(this.category().id);
  }
}
