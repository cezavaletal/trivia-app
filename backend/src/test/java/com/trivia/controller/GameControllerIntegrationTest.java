package com.trivia.controller;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.trivia.dto.auth.RegisterRequest;
import com.trivia.dto.game.StartGameRequest;
import com.trivia.dto.game.SubmitAnswerRequest;
import com.trivia.entity.Categoria;
import com.trivia.entity.OpcionRespuesta;
import com.trivia.entity.Pregunta;
import com.trivia.entity.enums.DificultadPregunta;
import com.trivia.repository.*;
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

import java.util.ArrayList;
import java.util.List;

import static org.hamcrest.Matchers.*;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GameControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UsuarioRepository usuarioRepository;

    @Autowired
    private CategoriaRepository categoriaRepository;

    @Autowired
    private PreguntaRepository preguntaRepository;

    @Autowired
    private OpcionRespuestaRepository opcionRespuestaRepository;

    @Autowired
    private PartidaRepository partidaRepository;

    @Autowired
    private RespuestaUsuarioRepository respuestaUsuarioRepository;

    private String playerToken;
    private String otherPlayerToken;
    private Categoria seededCategory;
    private List<Pregunta> seededQuestions = new ArrayList<>();

    @BeforeEach
    void setUpDatabase() throws Exception {
        respuestaUsuarioRepository.deleteAll();
        partidaRepository.deleteAll();
        opcionRespuestaRepository.deleteAll();
        preguntaRepository.deleteAll();
        categoriaRepository.deleteAll();
        usuarioRepository.deleteAll();

        // 1. Crear categoría
        seededCategory = new Categoria(null, "Ciencia General", "ciencia-general", "Retos científicos", "flask", true);
        seededCategory = categoriaRepository.save(seededCategory);

        // 2. Crear 10 preguntas activas con 4 opciones cada una
        seededQuestions.clear();
        for (int i = 1; i <= 10; i++) {
            Pregunta p = new Pregunta(null, seededCategory, "¿Pregunta de prueba #" + i + "?", DificultadPregunta.MEDIA, "Explicación detallada #" + i, true);
            Pregunta savedP = preguntaRepository.save(p);

            OpcionRespuesta opCorrect = new OpcionRespuesta(null, savedP, "Opción Correcta #" + i, true);
            OpcionRespuesta opWrong1 = new OpcionRespuesta(null, savedP, "Opción Incorrecta A #" + i, false);
            OpcionRespuesta opWrong2 = new OpcionRespuesta(null, savedP, "Opción Incorrecta B #" + i, false);
            OpcionRespuesta opWrong3 = new OpcionRespuesta(null, savedP, "Opción Incorrecta C #" + i, false);

            opcionRespuestaRepository.saveAll(List.of(opCorrect, opWrong1, opWrong2, opWrong3));
            seededQuestions.add(savedP);
        }

        // 3. Registrar jugadores de prueba y obtener sus JWT tokens
        playerToken = obtainJwtToken("gamer_one", "gamer1@example.com");
        otherPlayerToken = obtainJwtToken("gamer_two", "gamer2@example.com");
    }

    private String obtainJwtToken(String username, String email) throws Exception {
        RegisterRequest register = new RegisterRequest(username, email, "Password123!");
        MvcResult res = mockMvc.perform(post("/api/v1/auth/register")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(register)))
            .andExpect(status().isCreated())
            .andReturn();
        return objectMapper.readTree(res.getResponse().getContentAsString()).get("accessToken").asText();
    }

    @Test
    @DisplayName("POST /api/v1/games sin token de autenticación es rechazado con 401 Unauthorized")
    void testStartGameUnauthenticated() throws Exception {
        mockMvc.perform(post("/api/v1/games")
                .contentType(MediaType.APPLICATION_JSON)
                .content("{}"))
            .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("POST /api/v1/games - Inicia partida y valida BLINDAJE ANTI-TRAMPAS (nunca expone isCorrect ni esCorrecta)")
    void testStartGameAntiCheatProtection() throws Exception {
        StartGameRequest request = new StartGameRequest("QUICK_PLAY", null);

        MvcResult result = mockMvc.perform(post("/api/v1/games")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
            .andExpect(status().isCreated())
            .andExpect(jsonPath("$.gameId", notNullValue()))
            .andExpect(jsonPath("$.gameMode", is("RAPIDA")))
            .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
            .andExpect(jsonPath("$.totalQuestions", is(10)))
            .andExpect(jsonPath("$.questions", hasSize(10)))
            // VALIDACIÓN ESTRICTA ANTI-TRAMPAS EN JSONPATH:
            .andExpect(jsonPath("$.questions[*].options[*].isCorrect").doesNotExist())
            .andExpect(jsonPath("$.questions[*].options[*].esCorrecta").doesNotExist())
            .andExpect(jsonPath("$.questions[*].isCorrect").doesNotExist())
            .andExpect(jsonPath("$.questions[*].options[*].id", notNullValue()))
            .andExpect(jsonPath("$.questions[*].options[*].text", notNullValue()))
            .andReturn();

        // Doble verificación: inspección directa de texto en crudo para asegurar ausencia absoluta
        String responseBody = result.getResponse().getContentAsString();
        assertFalse(responseBody.contains("isCorrect"), "El payload de juego NUNCA debe contener 'isCorrect'");
        assertFalse(responseBody.contains("esCorrecta"), "El payload de juego NUNCA debe contener 'esCorrecta'");
    }

    @Test
    @DisplayName("GET /api/v1/games/{id} - Consulta estado de partida sin exponer respuestas ni trampas")
    void testGetGameState() throws Exception {
        // Iniciar partida
        StartGameRequest startReq = new StartGameRequest("QUICK_PLAY", null);
        MvcResult startResult = mockMvc.perform(post("/api/v1/games")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(startReq)))
            .andExpect(status().isCreated())
            .andReturn();

        long gameId = objectMapper.readTree(startResult.getResponse().getContentAsString()).get("gameId").asLong();

        // Consultar estado con el mismo usuario
        mockMvc.perform(get("/api/v1/games/" + gameId)
                .header("Authorization", "Bearer " + playerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.gameId", is((int) gameId)))
            .andExpect(jsonPath("$.status", is("IN_PROGRESS")))
            .andExpect(jsonPath("$.totalScore", is(0)))
            .andExpect(jsonPath("$.currentStreak", is(0)))
            .andExpect(jsonPath("$.answeredCount", is(0)))
            .andExpect(jsonPath("$.totalQuestions", is(10)))
            .andExpect(jsonPath("$.currentQuestionIndex", is(1)))
            .andExpect(jsonPath("$.isCorrect").doesNotExist())
            .andExpect(jsonPath("$.options").doesNotExist());
    }

    @Test
    @DisplayName("GET /api/v1/games/{id} con otro usuario retorna 403 Forbidden y RFC 7807")
    void testGetGameStateForbiddenForOtherUser() throws Exception {
        // Inicia gamer_one
        StartGameRequest startReq = new StartGameRequest("QUICK_PLAY", null);
        MvcResult startResult = mockMvc.perform(post("/api/v1/games")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(startReq)))
            .andExpect(status().isCreated())
            .andReturn();

        long gameId = objectMapper.readTree(startResult.getResponse().getContentAsString()).get("gameId").asLong();

        // Consulta gamer_two
        mockMvc.perform(get("/api/v1/games/" + gameId)
                .header("Authorization", "Bearer " + otherPlayerToken))
            .andExpect(status().isForbidden())
            .andExpect(jsonPath("$.status", is(403)))
            .andExpect(jsonPath("$.error", is("Forbidden")))
            .andExpect(jsonPath("$.message", containsString("pertenece a otro usuario")));
    }

    @Test
    @DisplayName("POST /api/v1/games/{id}/answers - Flujo de respuesta y control de unicidad (409 Conflict si ya se respondió)")
    void testSubmitAnswerAndUniquenessConflict() throws Exception {
        // 1. Iniciar partida
        StartGameRequest startReq = new StartGameRequest("QUICK_PLAY", null);
        MvcResult startResult = mockMvc.perform(post("/api/v1/games")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(startReq)))
            .andExpect(status().isCreated())
            .andReturn();

        JsonNode rootNode = objectMapper.readTree(startResult.getResponse().getContentAsString());
        long gameId = rootNode.get("gameId").asLong();
        long questionId = rootNode.get("questions").get(0).get("id").asLong();
        long selectedOptionId = rootNode.get("questions").get(0).get("options").get(0).get("id").asLong();

        // 2. Enviar primera respuesta válida
        SubmitAnswerRequest answerReq = new SubmitAnswerRequest(questionId, selectedOptionId, 3500);
        mockMvc.perform(post("/api/v1/games/" + gameId + "/answers")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answerReq)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.questionId", is((int) questionId)))
            .andExpect(jsonPath("$.isCorrect", notNullValue()))
            .andExpect(jsonPath("$.correctOptionId", notNullValue()))
            .andExpect(jsonPath("$.scoreCalculation", notNullValue()))
            .andExpect(jsonPath("$.gameProgress.remainingQuestions", is(9)));

        // 3. Intento de reenvío para la MISMA pregunta en la MISMA partida -> Espera 409 Conflict (RN-04)
        mockMvc.perform(post("/api/v1/games/" + gameId + "/answers")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(answerReq)))
            .andExpect(status().isConflict())
            .andExpect(jsonPath("$.timestamp", notNullValue()))
            .andExpect(jsonPath("$.status", is(409)))
            .andExpect(jsonPath("$.error", is("Conflict")))
            .andExpect(jsonPath("$.message", containsString("ya fue respondida previamente dentro de esta partida")))
            .andExpect(jsonPath("$.path", is("/api/v1/games/" + gameId + "/answers")));
    }

    @Test
    @DisplayName("POST /api/v1/games/{id}/finish - Finaliza la partida y calcula resumen y precisión")
    void testFinishGameEndpoint() throws Exception {
        // Iniciar partida
        StartGameRequest startReq = new StartGameRequest("QUICK_PLAY", null);
        MvcResult startResult = mockMvc.perform(post("/api/v1/games")
                .header("Authorization", "Bearer " + playerToken)
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(startReq)))
            .andExpect(status().isCreated())
            .andReturn();

        long gameId = objectMapper.readTree(startResult.getResponse().getContentAsString()).get("gameId").asLong();

        // Cerrar partida
        mockMvc.perform(post("/api/v1/games/" + gameId + "/finish")
                .header("Authorization", "Bearer " + playerToken))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.gameId", is((int) gameId)))
            .andExpect(jsonPath("$.status", is("COMPLETED")))
            .andExpect(jsonPath("$.accuracyPercentage", notNullValue()))
            .andExpect(jsonPath("$.leaderboardUpdate", notNullValue()));
    }
}
