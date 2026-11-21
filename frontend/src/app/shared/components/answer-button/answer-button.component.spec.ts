import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AnswerButtonComponent } from './answer-button.component';

describe('AnswerButtonComponent', () => {
  let component: AnswerButtonComponent;
  let fixture: ComponentFixture<AnswerButtonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnswerButtonComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AnswerButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe inicializarse con estado DEFAULT y atajo de teclado por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.keyIndex()).toBe('1');
    expect(component.state()).toBe('DEFAULT');
    expect(component.disabled()).toBeFalse();
  });

  it('debe emitir onAnswerSelect al hacer click cuando el botón está habilitado en estado DEFAULT', () => {
    let selected = false;
    component.onAnswerSelect.subscribe(() => {
      selected = true;
    });

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(selected).toBeTrue();
  });

  it('NO debe emitir onAnswerSelect cuando el botón está deshabilitado', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();

    let selected = false;
    component.onAnswerSelect.subscribe(() => {
      selected = true;
    });

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    button.click();

    expect(selected).toBeFalse();
  });

  it('NO debe emitir onAnswerSelect si el estado ya no es DEFAULT (ej: SELECTED, CORRECT, INCORRECT)', () => {
    fixture.componentRef.setInput('state', 'SELECTED');
    fixture.detectChanges();

    let selected = false;
    component.onAnswerSelect.subscribe(() => {
      selected = true;
    });

    component.onClick();
    expect(selected).toBeFalse();
  });

  it('debe renderizar clases CSS correctas y badge según el estado de respuesta', () => {
    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    const badge: HTMLElement = fixture.nativeElement.querySelector('.key-badge');

    // 1. SELECTED
    fixture.componentRef.setInput('state', 'SELECTED');
    fixture.detectChanges();
    expect(button.classList.contains('answer-btn--selected')).toBeTrue();

    // 2. CORRECT
    fixture.componentRef.setInput('state', 'CORRECT');
    fixture.detectChanges();
    expect(button.classList.contains('answer-btn--correct')).toBeTrue();
    expect(badge.textContent?.trim()).toBe('✓');

    // 3. INCORRECT
    fixture.componentRef.setInput('state', 'INCORRECT');
    fixture.detectChanges();
    expect(button.classList.contains('answer-btn--incorrect')).toBeTrue();
    expect(badge.textContent?.trim()).toBe('✕');

    // 4. TIMEOUT
    fixture.componentRef.setInput('state', 'TIMEOUT');
    fixture.detectChanges();
    expect(button.classList.contains('answer-btn--timeout')).toBeTrue();
    expect(badge.textContent?.trim()).toBe('⏱');
  });

  it('debe reflejar el atajo de teclado en el atributo aria-keyshortcuts', () => {
    fixture.componentRef.setInput('keyIndex', '3');
    fixture.detectChanges();

    const button: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    expect(button.getAttribute('aria-keyshortcuts')).toBe('3');
  });
});
