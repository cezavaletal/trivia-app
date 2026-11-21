import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { AuthResponse } from '../models';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  beforeEach(() => {
    localStorage.clear();
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('debe inicializarse como no autenticado si no hay token en LocalStorage', () => {
    expect(service).toBeTruthy();
    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
  });

  it('login() debe almacenar token en LocalStorage y actualizar signals de usuario y token', () => {
    const mockAuthResponse: AuthResponse = {
      tokenType: 'Bearer',
      accessToken: 'jwt.sample.token',
      expiresInSeconds: 3600,
      user: {
        id: 42,
        username: 'speedy_player',
        email: 'speedy@example.com',
        roles: ['ROLE_PLAYER']
      }
    };

    service.login({ usernameOrEmail: 'speedy_player', password: 'Password123!' }).subscribe(res => {
      expect(res.accessToken).toBe('jwt.sample.token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/login`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);

    expect(service.token()).toBe('jwt.sample.token');
    expect(service.currentUser()?.username).toBe('speedy_player');
    expect(service.isAuthenticated()).toBeTrue();
    expect(localStorage.getItem('trivia_access_token')).toBe('jwt.sample.token');
  });

  it('register() debe registrar exitosamente, guardar token y actualizar signals', () => {
    const mockAuthResponse: AuthResponse = {
      tokenType: 'Bearer',
      accessToken: 'new.jwt.token',
      expiresInSeconds: 3600,
      user: {
        id: 43,
        username: 'rookie_player',
        email: 'rookie@example.com',
        roles: ['ROLE_PLAYER']
      }
    };

    service.register({ username: 'rookie_player', email: 'rookie@example.com', password: 'Password123!' }).subscribe(res => {
      expect(res.accessToken).toBe('new.jwt.token');
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/auth/register`);
    expect(req.request.method).toBe('POST');
    req.flush(mockAuthResponse);

    expect(service.token()).toBe('new.jwt.token');
    expect(service.currentUser()?.id).toBe(43);
    expect(service.isAuthenticated()).toBeTrue();
  });

  it('logout() debe remover token y datos de LocalStorage, reiniciar signals y redirigir a /login', () => {
    // Simulamos sesión activa
    service.token.set('existing.token');
    service.currentUser.set({ id: 1, username: 'user1', email: 'u1@test.com', roles: ['ROLE_PLAYER'] });
    localStorage.setItem('trivia_access_token', 'existing.token');

    service.logout();

    expect(service.token()).toBeNull();
    expect(service.currentUser()).toBeNull();
    expect(service.isAuthenticated()).toBeFalse();
    expect(localStorage.getItem('trivia_access_token')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});
