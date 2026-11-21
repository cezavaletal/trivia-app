import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TimerBarComponent } from './timer-bar.component';

describe('TimerBarComponent', () => {
  let component: TimerBarComponent;
  let fixture: ComponentFixture<TimerBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimerBarComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(TimerBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('debe crearse correctamente con valores por defecto', () => {
    expect(component).toBeTruthy();
    expect(component.totalSeconds()).toBe(15);
    expect(component.remainingSeconds()).toBe(15);
    expect(component.percentage()).toBe(100);
    expect(component.formattedSeconds()).toBe('15');
    expect(component.colorState()).toBe('green');
    expect(component.isCritical()).toBeFalse();
  });

  it('debe formatear segundos con cero inicial cuando es menor a 10', () => {
    fixture.componentRef.setInput('remainingSeconds', 7);
    fixture.detectChanges();

    expect(component.formattedSeconds()).toBe('07');
  });

  it('debe calcular el porcentaje exacto y ajustar colores según el tiempo restante', () => {
    // 50% de 15s es 7.5s -> porcentaje = 50% -> estado 'yellow'
    fixture.componentRef.setInput('totalSeconds', 20);
    fixture.componentRef.setInput('remainingSeconds', 12);
    fixture.detectChanges();

    // 12/20 = 60% -> verde
    expect(component.percentage()).toBe(60);
    expect(component.colorState()).toBe('green');

    // 7/20 = 35% -> amarillo
    fixture.componentRef.setInput('remainingSeconds', 7);
    fixture.detectChanges();
    expect(component.percentage()).toBe(35);
    expect(component.colorState()).toBe('yellow');

    // 4/20 = 20% -> rojo
    fixture.componentRef.setInput('remainingSeconds', 4);
    fixture.detectChanges();
    expect(component.percentage()).toBe(20);
    expect(component.colorState()).toBe('red');
  });

  it('debe activar estado crítico cuando los segundos restantes son <= 3 y > 0', () => {
    fixture.componentRef.setInput('remainingSeconds', 3);
    fixture.detectChanges();
    expect(component.isCritical()).toBeTrue();

    fixture.componentRef.setInput('remainingSeconds', 1);
    fixture.detectChanges();
    expect(component.isCritical()).toBeTrue();

    fixture.componentRef.setInput('remainingSeconds', 0);
    fixture.detectChanges();
    expect(component.isCritical()).toBeFalse();
  });

  it('debe retornar 0% cuando totalSeconds es menor o igual a 0', () => {
    fixture.componentRef.setInput('totalSeconds', 0);
    fixture.componentRef.setInput('remainingSeconds', 0);
    fixture.detectChanges();

    expect(component.percentage()).toBe(0);
  });

  it('debe emitir evento onTimeout cuando se dispara manualmente la notificación', () => {
    let timeoutEmitted = false;
    component.onTimeout.subscribe(() => {
      timeoutEmitted = true;
    });

    component.onTimeout.emit();
    expect(timeoutEmitted).toBeTrue();
  });
});
