package com.trivia.service;

import com.trivia.dto.auth.*;
import com.trivia.entity.Usuario;
import com.trivia.entity.enums.EstadoPartida;
import com.trivia.entity.enums.RolUsuario;
import com.trivia.exception.BadRequestException;
import com.trivia.exception.ConflictException;
import com.trivia.exception.ResourceNotFoundException;
import com.trivia.exception.UnauthorizedException;
import com.trivia.repository.PartidaRepository;
import com.trivia.repository.UsuarioRepository;
import com.trivia.security.JwtService;
import com.trivia.security.UserPrincipal;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PartidaRepository partidaRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    public AuthService(
        UsuarioRepository usuarioRepository,
        PartidaRepository partidaRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService,
        AuthenticationManager authenticationManager
    ) {
        this.usuarioRepository = usuarioRepository;
        this.partidaRepository = partidaRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.authenticationManager = authenticationManager;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (usuarioRepository.existsByUsername(request.username())) {
            throw new ConflictException("El nombre de usuario ya se encuentra registrado");
        }
        if (usuarioRepository.existsByEmail(request.email())) {
            throw new ConflictException("El correo electrónico ya se encuentra registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setUsername(request.username().trim());
        usuario.setEmail(request.email().trim().toLowerCase());
        usuario.setPasswordHash(passwordEncoder.encode(request.password()));
        usuario.setRol(RolUsuario.ROLE_PLAYER);
        usuario.setIsActive(true);

        Usuario saved = usuarioRepository.save(usuario);

        UserPrincipal principal = UserPrincipal.create(saved);
        String token = jwtService.generateToken(principal, saved.getId());

        UserSummaryDto userSummary = new UserSummaryDto(
            saved.getId(),
            saved.getUsername(),
            saved.getEmail(),
            List.of(saved.getRol().name()),
            saved.getCreatedAt()
        );

        return AuthResponse.of(token, jwtService.getJwtExpirationSeconds(), userSummary);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.usernameOrEmail(), request.password())
            );

            UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
            Usuario usuario = usuarioRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("Credenciales incorrectas"));

            String token = jwtService.generateToken(principal, usuario.getId());

            UserSummaryDto userSummary = new UserSummaryDto(
                usuario.getId(),
                usuario.getUsername(),
                usuario.getEmail(),
                List.of(usuario.getRol().name()),
                usuario.getCreatedAt()
            );

            return AuthResponse.of(token, jwtService.getJwtExpirationSeconds(), userSummary);
        } catch (BadCredentialsException ex) {
            throw new UnauthorizedException("Credenciales incorrectas");
        }
    }

    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUserProfile(String username) {
        Usuario usuario = usuarioRepository.findByUsername(username)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        long gamesPlayed = partidaRepository.countByUsuarioIdAndEstado(usuario.getId(), EstadoPartida.COMPLETED);
        int highestScore = partidaRepository.findMaxScoreByUsuarioIdAndEstado(usuario.getId(), EstadoPartida.COMPLETED);
        int totalCorrect = partidaRepository.sumAciertosByUsuarioIdAndEstado(usuario.getId(), EstadoPartida.COMPLETED);
        int bestStreak = partidaRepository.findMaxRachaByUsuarioIdAndEstado(usuario.getId(), EstadoPartida.COMPLETED);

        UserStatsDto stats = new UserStatsDto(gamesPlayed, highestScore, totalCorrect, bestStreak);

        return new UserProfileResponse(
            usuario.getId(),
            usuario.getUsername(),
            usuario.getEmail(),
            List.of(usuario.getRol().name()),
            stats
        );
    }
}
