package com.trivia.controller;

import com.trivia.dto.auth.AuthResponse;
import com.trivia.dto.auth.LoginRequest;
import com.trivia.dto.auth.RegisterRequest;
import com.trivia.dto.auth.UserProfileResponse;
import com.trivia.security.UserPrincipal;
import com.trivia.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping({"/api/v1/auth", "/api/auth"})
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserProfileResponse> me(@AuthenticationPrincipal UserPrincipal userPrincipal) {
        if (userPrincipal == null) {
            throw new com.trivia.exception.UnauthorizedException("Usuario no autenticado");
        }
        UserProfileResponse response = authService.getCurrentUserProfile(userPrincipal.getUsername());
        return ResponseEntity.ok(response);
    }
}
