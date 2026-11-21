import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { HeaderComponent } from '../../shared/components/header/header.component';

@Component({
  selector: 'app-auth',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, HeaderComponent],
  template: `
    <app-header />
    <main class="auth-page">
      <div class="auth-card">
        <div class="auth-header">
          <div class="auth-badge">⚡ TRIVIA ARENA</div>
          <h1 class="auth-title">
            {{ isRegisterMode() ? 'Crea tu Cuenta' : 'Bienvenido de Vuelta' }}
          </h1>
          <p class="auth-subtitle">
            {{ isRegisterMode() 
              ? 'Únete a miles de jugadores y compite por la cima global' 
              : 'Ingresa para continuar tu racha y ganar puntos XP' }}
          </p>
        </div>

        @if (errorMessage()) {
          <div class="alert-error" role="alert">
            <span class="alert-icon">⚠️</span>
            <span>{{ errorMessage() }}</span>
          </div>
        }

        <form [formGroup]="authForm" (ngSubmit)="onSubmit()" class="auth-form" novalidate>
          @if (isRegisterMode()) {
            <div class="form-group">
              <label for="username" class="form-label">Nombre de Usuario</label>
              <input 
                id="username" 
                type="text" 
                formControlName="username" 
                class="form-input" 
                [class.form-input--error]="hasError('username')"
                placeholder="ej. AlexGamer"
                autocomplete="username"
              >
              @if (hasError('username')) {
                <span class="field-error">El nombre de usuario debe tener al menos 3 caracteres</span>
              }
            </div>

            <div class="form-group">
              <label for="email" class="form-label">Correo Electrónico</label>
              <input 
                id="email" 
                type="email" 
                formControlName="email" 
                class="form-input" 
                [class.form-input--error]="hasError('email')"
                placeholder="correo@ejemplo.com"
                autocomplete="email"
              >
              @if (hasError('email')) {
                <span class="field-error">Ingresa un correo electrónico válido</span>
              }
            </div>
          } @else {
            <div class="form-group">
              <label for="usernameOrEmail" class="form-label">Usuario o Correo</label>
              <input 
                id="usernameOrEmail" 
                type="text" 
                formControlName="usernameOrEmail" 
                class="form-input" 
                [class.form-input--error]="hasError('usernameOrEmail')"
                placeholder="tu_usuario o correo@ejemplo.com"
                autocomplete="username"
              >
              @if (hasError('usernameOrEmail')) {
                <span class="field-error">Este campo es requerido</span>
              }
            </div>
          }

          <div class="form-group">
            <label for="password" class="form-label">Contraseña</label>
            <input 
              id="password" 
              type="password" 
              formControlName="password" 
              class="form-input" 
              [class.form-input--error]="hasError('password')"
              placeholder="••••••••"
              autocomplete="current-password"
            >
            @if (hasError('password')) {
              <span class="field-error">La contraseña debe tener al menos 6 caracteres</span>
            }
          </div>

          <button type="submit" class="submit-btn" [disabled]="loading()">
            @if (loading()) {
              <span class="spinner"></span>
              <span>Procesando...</span>
            } @else {
              <span>{{ isRegisterMode() ? 'Registrarse y Comenzar' : 'Entrar a la Arena' }}</span>
              <span class="arrow-icon">→</span>
            }
          </button>
        </form>

        <div class="auth-footer">
          @if (isRegisterMode()) {
            <span>¿Ya tienes una cuenta?</span>
            <a routerLink="/login" class="link-toggle">Inicia Sesión</a>
          } @else {
            <span>¿Aún no tienes cuenta?</span>
            <a routerLink="/register" class="link-toggle">Regístrate Gratis</a>
          }
        </div>
      </div>
    </main>
  `,
  styles: [`
    .auth-page {
      min-height: calc(100vh - 65px);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: var(--space-6) var(--space-4);
      background: radial-gradient(circle at 50% 20%, rgba(99, 102, 241, 0.12), transparent 70%);
    }

    .auth-card {
      width: 100%;
      max-width: 440px;
      background: var(--surface-card);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-xl);
      padding: var(--space-8);
      box-shadow: var(--shadow-elevation-high);
      animation: bounce-in 300ms ease-out;
    }

    @media (max-width: 480px) {
      .auth-card {
        padding: var(--space-5);
      }
    }

    .auth-header {
      text-align: center;
      margin-bottom: var(--space-6);
    }

    .auth-badge {
      display: inline-block;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.1em;
      color: var(--accent-cyan);
      margin-bottom: var(--space-2);
    }

    .auth-title {
      font-family: var(--font-display);
      font-size: 26px;
      font-weight: 800;
      color: var(--text-primary);
      margin-bottom: var(--space-2);
      line-height: 1.2;
    }

    .auth-subtitle {
      font-size: 14px;
      color: var(--text-secondary);
      line-height: 1.4;
    }

    .alert-error {
      display: flex;
      align-items: center;
      gap: 10px;
      background: rgba(239, 68, 68, 0.15);
      border: 1px solid var(--game-danger);
      color: #FEF2F2;
      padding: 10px 14px;
      border-radius: var(--radius-md);
      font-size: 13px;
      margin-bottom: var(--space-4);
      animation: fade-slide-down 200ms ease-out;
    }

    .alert-icon {
      font-size: 16px;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .form-label {
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
    }

    .form-input {
      padding: 12px 16px;
      background: var(--surface-elevated);
      border: 1px solid var(--surface-border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-size: 15px;
      transition: all var(--transition-fast);
      outline: none;
    }

    .form-input:focus {
      border-color: var(--brand-primary-400);
      box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.25);
    }

    .form-input--error {
      border-color: var(--game-danger) !important;
    }

    .field-error {
      font-size: 12px;
      color: var(--game-danger);
      font-weight: 500;
    }

    .submit-btn {
      margin-top: var(--space-2);
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 14px;
      background: var(--brand-primary-500);
      color: #FFFFFF;
      border-radius: var(--radius-md);
      font-family: var(--font-display);
      font-size: 16px;
      font-weight: 700;
      box-shadow: 0 4px 14px rgba(99, 102, 241, 0.4);
      transition: all var(--transition-fast);
    }

    .submit-btn:hover:not(:disabled) {
      background: var(--brand-primary-600);
      transform: translateY(-1px);
      box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
    }

    .submit-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .spinner {
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-top-color: #FFFFFF;
      border-radius: 50%;
      animation: spin 600ms linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      margin-top: var(--space-6);
      padding-top: var(--space-4);
      border-top: 1px solid var(--surface-border);
      text-align: center;
      font-size: 14px;
      color: var(--text-secondary);
      display: flex;
      justify-content: center;
      gap: 6px;
    }

    .link-toggle {
      color: var(--accent-cyan);
      font-weight: 600;
      text-decoration: underline;
    }

    .link-toggle:hover {
      color: var(--brand-primary-400);
    }
  `]
})
export class AuthComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  readonly isRegisterMode = signal<boolean>(false);
  readonly loading = signal<boolean>(false);
  readonly errorMessage = signal<string | null>(null);

  authForm!: FormGroup;

  ngOnInit(): void {
    const isRegister = this.route.snapshot.url.some(seg => seg.path === 'register');
    this.isRegisterMode.set(isRegister);
    this.buildForm();
  }

  private buildForm(): void {
    if (this.isRegisterMode()) {
      this.authForm = this.fb.group({
        username: ['', [Validators.required, Validators.minLength(3)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    } else {
      this.authForm = this.fb.group({
        usernameOrEmail: ['', [Validators.required]],
        password: ['', [Validators.required, Validators.minLength(6)]]
      });
    }
  }

  hasError(field: string): boolean {
    const control = this.authForm.get(field);
    return !!(control && control.invalid && (control.dirty || control.touched));
  }

  onSubmit(): void {
    if (this.authForm.invalid) {
      this.authForm.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const val = this.authForm.value;
    const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

    if (this.isRegisterMode()) {
      this.authService.register({
        username: val.username,
        email: val.email,
        password: val.password
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Error al registrar el usuario. Revisa los datos.');
        }
      });
    } else {
      this.authService.login({
        usernameOrEmail: val.usernameOrEmail,
        password: val.password
      }).subscribe({
        next: () => {
          this.loading.set(false);
          this.router.navigateByUrl(returnUrl);
        },
        error: (err) => {
          this.loading.set(false);
          this.errorMessage.set(err.error?.message || 'Credenciales inválidas. Verifica tu usuario y contraseña.');
        }
      });
    }
  }
}
