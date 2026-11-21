package com.trivia.service;

import com.trivia.dto.auth.AuthResponse;
import com.trivia.dto.auth.LoginRequest;
import com.trivia.dto.auth.RegisterRequest;
import com.trivia.dto.auth.UserProfileResponse;
import com.trivia.entity.Usuario;
import com.trivia.entity.enums.EstadoPartida;
import com.trivia.entity.enums.RolUsuario;
import com.trivia.exception.ConflictException;
import com.trivia.exception.ResourceNotFoundException;
import com.trivia.exception.UnauthorizedException;
import com.trivia.repository.PartidaRepository;
import com.trivia.repository.UsuarioRepository;
import com.trivia.security.JwtService;
import com.trivia.security.UserPrincipal;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceUnitTest {

    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private PartidaRepository partidaRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtService jwtService;
    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthService authService;

    private Usuario mockUser;

    @BeforeEach
    void setUp() {
        mockUser = new Usuario(1L, "trivia_champion", "champion@example.com", "$2a$10$encodedHash", RolUsuario.ROLE_PLAYER, true);
        mockUser.setCreatedAt(Instant.now());
    }

    @Nested
    @DisplayName("Pruebas de Registro (register)")
    class RegisterTests {

        @Test
        @DisplayName("Registro exitoso de nuevo jugador con generación de token JWT")
        void testRegisterSuccess() {
            RegisterRequest request = new RegisterRequest("trivia_champion", "champion@example.com", "Password123!");

            when(usuarioRepository.existsByUsername("trivia_champion")).thenReturn(false);
            when(usuarioRepository.existsByEmail("champion@example.com")).thenReturn(false);
            when(passwordEncoder.encode("Password123!")).thenReturn("$2a$10$encodedHash");
            when(usuarioRepository.save(any(Usuario.class))).thenReturn(mockUser);
            when(jwtService.generateToken(any(UserPrincipal.class), eq(1L))).thenReturn("mock.jwt.token");
            when(jwtService.getJwtExpirationSeconds()).thenReturn(3600L);

            AuthResponse response = authService.register(request);

            assertNotNull(response);
            assertEquals("Bearer", response.tokenType());
            assertEquals("mock.jwt.token", response.accessToken());
            assertEquals(3600L, response.expiresInSeconds());
            assertNotNull(response.user());
            assertEquals("trivia_champion", response.user().username());
            assertEquals("champion@example.com", response.user().email());
            assertTrue(response.user().roles().contains("ROLE_PLAYER"));

            verify(usuarioRepository).save(any(Usuario.class));
        }

        @Test
        @DisplayName("Rechazo con 409 Conflict si el nombre de usuario ya existe")
        void testRegisterDuplicateUsername() {
            RegisterRequest request = new RegisterRequest("trivia_champion", "new@example.com", "Password123!");
            when(usuarioRepository.existsByUsername("trivia_champion")).thenReturn(true);

            ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(request));
            assertTrue(ex.getMessage().contains("nombre de usuario ya se encuentra registrado"));
            verify(usuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("Rechazo con 409 Conflict si el correo electrónico ya existe")
        void testRegisterDuplicateEmail() {
            RegisterRequest request = new RegisterRequest("new_player", "champion@example.com", "Password123!");
            when(usuarioRepository.existsByUsername("new_player")).thenReturn(false);
            when(usuarioRepository.existsByEmail("champion@example.com")).thenReturn(true);

            ConflictException ex = assertThrows(ConflictException.class, () -> authService.register(request));
            assertTrue(ex.getMessage().contains("correo electrónico ya se encuentra registrado"));
            verify(usuarioRepository, never()).save(any());
        }
    }

    @Nested
    @DisplayName("Pruebas de Inicio de Sesión (login)")
    class LoginTests {

        @Test
        @DisplayName("Login exitoso con credenciales correctas retorna token JWT válido")
        void testLoginSuccess() {
            LoginRequest request = new LoginRequest("trivia_champion", "Password123!");
            UserPrincipal principal = UserPrincipal.create(mockUser);
            Authentication auth = mock(Authentication.class);
            when(auth.getPrincipal()).thenReturn(principal);

            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(auth);
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(mockUser));
            when(jwtService.generateToken(any(UserPrincipal.class), eq(1L))).thenReturn("valid.jwt.token");
            when(jwtService.getJwtExpirationSeconds()).thenReturn(3600L);

            AuthResponse response = authService.login(request);

            assertNotNull(response);
            assertEquals("Bearer", response.tokenType());
            assertEquals("valid.jwt.token", response.accessToken());
            assertEquals("trivia_champion", response.user().username());
        }

        @Test
        @DisplayName("Rechazo con 401 Unauthorized si las credenciales son incorrectas")
        void testLoginBadCredentials() {
            LoginRequest request = new LoginRequest("trivia_champion", "wrongPassword");
            when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

            UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.login(request));
            assertEquals("Credenciales incorrectas", ex.getMessage());
        }
    }

    @Nested
    @DisplayName("Pruebas de Perfil de Usuario (getCurrentUserProfile)")
    class ProfileTests {

        @Test
        @DisplayName("Obtiene el perfil y las estadísticas consolidadas del jugador")
        void testGetCurrentUserProfileSuccess() {
            when(usuarioRepository.findByUsername("trivia_champion")).thenReturn(Optional.of(mockUser));
            when(partidaRepository.countByUsuarioIdAndEstado(1L, EstadoPartida.COMPLETED)).thenReturn(45L);
            when(partidaRepository.findMaxScoreByUsuarioIdAndEstado(1L, EstadoPartida.COMPLETED)).thenReturn(3850);
            when(partidaRepository.sumAciertosByUsuarioIdAndEstado(1L, EstadoPartida.COMPLETED)).thenReturn(380);
            when(partidaRepository.findMaxRachaByUsuarioIdAndEstado(1L, EstadoPartida.COMPLETED)).thenReturn(10);

            UserProfileResponse response = authService.getCurrentUserProfile("trivia_champion");

            assertNotNull(response);
            assertEquals("trivia_champion", response.username());
            assertEquals(45L, response.stats().gamesPlayed());
            assertEquals(3850, response.stats().highestScore());
            assertEquals(380, response.stats().totalCorrectAnswers());
            assertEquals(10, response.stats().bestStreak());
        }

        @Test
        @DisplayName("Lanza ResourceNotFoundException si el usuario no existe")
        void testGetCurrentUserProfileNotFound() {
            when(usuarioRepository.findByUsername("unknown")).thenReturn(Optional.empty());

            assertThrows(ResourceNotFoundException.class, () -> authService.getCurrentUserProfile("unknown"));
        }
    }
}
