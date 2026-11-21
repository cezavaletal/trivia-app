package com.trivia.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.trivia.dto.auth.LoginRequest;
import com.trivia.dto.auth.RegisterRequest;
import com.trivia.repository.UsuarioRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @BeforeEach
    void cleanUp() {
        usuarioRepository.deleteAll();
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Registro exitoso retorna 201 Created y token JWT")
    void testRegisterSuccess() throws Exception {
        RegisterRequest request = new RegisterRequest("new_champion", "champion@example.com", "Password123!");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_JSON))
            .andExpect(jsonPath("$.tokenType", is("Bearer")))
            .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
            .andExpect(jsonPath("$.expiresInSeconds", greaterThan(0)))
            .andExpect(jsonPath("$.user.username", is("new_champion")))
            .andExpect(jsonPath("$.user.email", is("champion@example.com")))
            .andExpect(jsonPath("$.user.roles[0]", is("ROLE_PLAYER")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Conflicto por usuario duplicado retorna 409 y RFC 7807")
    void testRegisterDuplicateUsernameReturns409() throws Exception {
        RegisterRequest first = new RegisterRequest("same_user", "user1@example.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(first)))
            .andExpect(status().isCreated());

        RegisterRequest duplicate = new RegisterRequest("same_user", "user2@example.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(duplicate)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.timestamp", not(emptyOrNullString())))
            .andExpect(jsonPath("$.status", is(409)))
            .andExpect(jsonPath("$.error", is("Conflict")))
            .andExpect(jsonPath("$.message", containsString("nombre de usuario ya se encuentra registrado")))
            .andExpect(jsonPath("$.path", is("/api/v1/auth/register")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/register - Error de validación de campos retorna 400 y RFC 7807")
    void testRegisterValidationFailureReturns400() throws Exception {
        // Contraseña menor a 8 caracteres y email inválido
        RegisterRequest invalid = new RegisterRequest("ab", "not-an-email", "short");

        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(invalid)))
            .andExpect(status().isBadRequest())
            .andExpect(jsonPath("$.status", is(400)))
            .andExpect(jsonPath("$.error", is("Bad Request")))
            .andExpect(jsonPath("$.validationErrors", hasSize(greaterThanOrEqualTo(1))));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Login exitoso retorna 200 OK y token JWT válido")
    void testLoginSuccess() throws Exception {
        RegisterRequest register = new RegisterRequest("login_user", "login@example.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated());

        LoginRequest login = new LoginRequest("login_user", "Password123!");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(login)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.tokenType", is("Bearer")))
            .andExpect(jsonPath("$.accessToken", not(emptyOrNullString())))
            .andExpect(jsonPath("$.user.username", is("login_user")));
    }

    @Test
    @DisplayName("POST /api/v1/auth/login - Credenciales erróneas retorna 401 Unauthorized y RFC 7807")
    void testLoginInvalidCredentialsReturns401() throws Exception {
        RegisterRequest register = new RegisterRequest("valid_user", "valid@example.com", "Password123!");
        mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated());

        LoginRequest badLogin = new LoginRequest("valid_user", "WrongPassword123!");
        mockMvc.perform(post("/api/v1/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(badLogin)))
            .andExpect(status().isUnauthorized())
            .andExpect(jsonPath("$.status", is(401)))
            .andExpect(jsonPath("$.error", is("Unauthorized")))
            .andExpect(jsonPath("$.message", is("Credenciales incorrectas")))
            .andExpect(jsonPath("$.path", is("/api/v1/auth/login")));
    }

    @Test
    @DisplayName("GET /api/v1/auth/me - Acceso protegido con JWT y rechazo sin token")
    void testMeEndpointAuthFlow() throws Exception {
        // 1. Sin token -> 401
        mockMvc.perform(get("/api/v1/auth/me"))
            .andExpect(status().isUnauthorized());

        // 2. Registramos usuario y obtenemos token
        RegisterRequest register = new RegisterRequest("me_user", "me@example.com", "Password123!");
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated())
            .andReturn();

        String responseStr = result.getResponse().getContentAsString();
        String token = objectMapper.readTree(responseStr).get("accessToken").asText();

        // 3. Con Bearer token -> 200 OK
        mockMvc.perform(get("/api/v1/auth/me")
                .header("Authorization", "Bearer " + token))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.username", is("me_user")))
            .andExpect(jsonPath("$.email", is("me@example.com")))
            .andExpect(jsonPath("$.roles[0]", is("ROLE_PLAYER")))
            .andExpect(jsonPath("$.stats.gamesPlayed", is(0)));
    }
}
