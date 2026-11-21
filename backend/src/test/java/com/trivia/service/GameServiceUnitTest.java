package com.trivia.service;

import com.trivia.dto.game.*;
import com.trivia.entity.*;
import com.trivia.entity.enums.DificultadPregunta;
import com.trivia.entity.enums.EstadoPartida;
import com.trivia.entity.enums.ModoPartida;
import com.trivia.entity.enums.RolUsuario;
import com.trivia.exception.BadRequestException;
import com.trivia.exception.ConflictException;
import com.trivia.exception.ForbiddenException;
import com.trivia.exception.InsufficientQuestionsException;
import com.trivia.exception.ResourceNotFoundException;
import com.trivia.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class GameServiceUnitTest {

    @Mock
    private PartidaRepository partidaRepository;
    @Mock
    private PreguntaRepository preguntaRepository;
    @Mock
    private OpcionRespuestaRepository opcionRespuestaRepository;
    @Mock
    private RespuestaUsuarioRepository respuestasUsuarioRepository;
    @Mock
    private UsuarioRepository usuarioRepository;
    @Mock
    private CategoriaRepository categoriaRepository;
    @Mock
    private RankingRepository rankingRepository;

    @InjectMocks
    private GameService gameService;

    private Usuario mockUser;
    private Categoria mockCategory;
    private Pregunta mockQuestion;
    private OpcionRespuesta correctOption;
    private OpcionRespuesta incorrectOption;

    @BeforeEach
    void setUp() {
        mockUser = new Usuario(1L, "player1", "player1@test.com", "hash", RolUsuario.ROLE_PLAYER, true);
        mockCategory = new Categoria(10L, "Ciencia", "ciencia", "Preguntas de ciencia", "flask", true);

        mockQuestion = new Pregunta(100L, mockCategory, "¿Cuál es la velocidad de la luz?", DificultadPregunta.MEDIA, "Aprox 300,000 km/s", true);
        correctOption = new OpcionRespuesta(201L, mockQuestion, "300.000 km/s", true);
        incorrectOption = new OpcionRespuesta(202L, mockQuestion, "150.000 km/s", false);
    }

    @Nested
    @DisplayName("Pruebas de Inicio de Partida (startGame)")
    class StartGameTests {

        @Test
        @DisplayName("Inicia partida rápida exitosamente con 10 preguntas sanitizadas")
        void testStartQuickPlaySuccess() {
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(mockUser));

            List<Pregunta> questions = new ArrayList<>();
            for (int i = 1; i <= 10; i++) {
                Pregunta q = new Pregunta((long) i, mockCategory, "Pregunta " + i, DificultadPregunta.FACIL, "Explicación", true);
                questions.add(q);
            }
            when(preguntaRepository.findRandomActiveQuestions(10)).thenReturn(questions);

            Partida savedPartida = new Partida(50L, mockUser, null, ModoPartida.RAPIDA, EstadoPartida.IN_PROGRESS);
            when(partidaRepository.save(any(Partida.class))).thenReturn(savedPartida);

            when(opcionRespuestaRepository.findByPreguntaId(anyLong())).thenReturn(List.of(
                new OpcionRespuesta(1L, mockQuestion, "Opción 1", true),
                new OpcionRespuesta(2L, mockQuestion, "Opción 2", false)
            ));

            StartGameRequest request = new StartGameRequest("QUICK_PLAY", null);
            StartGameResponse response = gameService.startGame(1L, request);

            assertNotNull(response);
            assertEquals(50L, response.gameId());
            assertEquals("RAPIDA", response.gameMode());
            assertEquals("IN_PROGRESS", response.status());
            assertEquals(10, response.totalQuestions());
            assertEquals(10, response.questions().size());
            verify(partidaRepository).save(any(Partida.class));
        }

        @Test
        @DisplayName("Inicia partida temática por categoría exitosamente")
        void testStartCategoryGameSuccess() {
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(mockUser));
            when(categoriaRepository.findById(10L)).thenReturn(Optional.of(mockCategory));

            List<Pregunta> questions = List.of(mockQuestion);
            when(preguntaRepository.findRandomActiveQuestionsByCategoria(10L, 10)).thenReturn(questions);

            Partida savedPartida = new Partida(51L, mockUser, mockCategory, ModoPartida.CATEGORIA, EstadoPartida.IN_PROGRESS);
            when(partidaRepository.save(any(Partida.class))).thenReturn(savedPartida);

            when(opcionRespuestaRepository.findByPreguntaId(mockQuestion.getId())).thenReturn(List.of(correctOption, incorrectOption));

            StartGameRequest request = new StartGameRequest("CATEGORY", 10L);
            StartGameResponse response = gameService.startGame(1L, request);

            assertNotNull(response);
            assertEquals(51L, response.gameId());
            assertEquals("CATEGORIA", response.gameMode());
            assertEquals(1, response.questions().size());
            assertEquals("Ciencia", response.questions().get(0).categoryName());
        }

        @Test
        @DisplayName("Lanza InsufficientQuestionsException si el banco de preguntas está vacío")
        void testStartGameInsufficientQuestions() {
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(mockUser));
            when(preguntaRepository.findRandomActiveQuestions(10)).thenReturn(List.of());

            StartGameRequest request = new StartGameRequest("QUICK_PLAY", null);
            assertThrows(InsufficientQuestionsException.class, () -> gameService.startGame(1L, request));
        }

        @Test
        @DisplayName("Lanza BadRequestException si se elige modo CATEGORY sin categoryId")
        void testStartCategoryGameWithoutCategoryId() {
            when(usuarioRepository.findById(1L)).thenReturn(Optional.of(mockUser));

            StartGameRequest request = new StartGameRequest("CATEGORY", null);
            assertThrows(BadRequestException.class, () -> gameService.startGame(1L, request));
        }
    }

    @Nested
    @DisplayName("Pruebas de Envío de Respuesta y Puntajes (submitAnswer)")
    class SubmitAnswerTests {

        private Partida activePartida;

        @BeforeEach
        void initPartida() {
            activePartida = new Partida(100L, mockUser, mockCategory, ModoPartida.RAPIDA, EstadoPartida.IN_PROGRESS);
            activePartida.setTiempoInicio(Instant.now());
            activePartida.setPuntajeTotal(0);
            activePartida.setAciertos(0);
            activePartida.setErrores(0);
            activePartida.setRachaMaxima(0);
        }

        @Test
        @DisplayName("Acierto con cálculo exacto de bonificación por velocidad y racha")
        void testSubmitCorrectAnswerWithSpeedBonusAndStreak() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));
            when(respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(100L, 100L)).thenReturn(false);
            when(preguntaRepository.findById(100L)).thenReturn(Optional.of(mockQuestion)); // MEDIA -> 200 pts

            // Racha actual previa = 2 (el próximo acierto será racha 3 -> multiplicador 1.4x)
            RespuestaUsuario prevAnswer = new RespuestaUsuario();
            prevAnswer.setRachaMomento(2);
            when(respuestasUsuarioRepository.findTopByPartidaIdOrderByRespondidaEnDesc(100L))
                .thenReturn(Optional.of(prevAnswer));

            when(opcionRespuestaRepository.findByIdAndPreguntaId(201L, 100L)).thenReturn(Optional.of(correctOption));
            when(opcionRespuestaRepository.findByPreguntaIdAndEsCorrectaTrue(100L)).thenReturn(Optional.of(correctOption));
            when(respuestasUsuarioRepository.countByPartidaId(100L)).thenReturn(1L);

            // clientDurationMs = 4200ms -> remaining = 10800ms
            // SpeedBonus = floor(200 * (10800 / 15000) * 0.5) = floor(200 * 0.72 * 0.5) = 72
            // Total awarded = floor((200 + 72) * 1.4) = floor(272 * 1.4) = floor(380.8) = 380
            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 201L, 4200);
            SubmitAnswerResponse response = gameService.submitAnswer(100L, 1L, request);

            assertTrue(response.isCorrect());
            assertEquals(201L, response.correctOptionId());
            assertEquals(200, response.scoreCalculation().baseScore());
            assertEquals(72, response.scoreCalculation().speedBonus());
            assertEquals(3, response.scoreCalculation().currentStreak());
            assertEquals(1.4, response.scoreCalculation().streakMultiplier(), 0.001);
            assertEquals(380, response.scoreCalculation().pointsAwarded());
            assertEquals(380, response.gameProgress().totalScore());
            assertEquals(3, response.gameProgress().currentStreak());

            verify(respuestasUsuarioRepository).save(any(RespuestaUsuario.class));
            verify(partidaRepository).save(activePartida);
        }

        @Test
        @DisplayName("Respuesta incorrecta: 0 puntos y reinicio de racha a 0")
        void testSubmitIncorrectAnswerResetsStreak() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));
            when(respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(100L, 100L)).thenReturn(false);
            when(preguntaRepository.findById(100L)).thenReturn(Optional.of(mockQuestion));

            // Venía con racha de 4
            RespuestaUsuario prevAnswer = new RespuestaUsuario();
            prevAnswer.setRachaMomento(4);
            when(respuestasUsuarioRepository.findTopByPartidaIdOrderByRespondidaEnDesc(100L))
                .thenReturn(Optional.of(prevAnswer));

            when(opcionRespuestaRepository.findByIdAndPreguntaId(202L, 100L)).thenReturn(Optional.of(incorrectOption));
            when(opcionRespuestaRepository.findByPreguntaIdAndEsCorrectaTrue(100L)).thenReturn(Optional.of(correctOption));
            when(respuestasUsuarioRepository.countByPartidaId(100L)).thenReturn(1L);

            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 202L, 3000);
            SubmitAnswerResponse response = gameService.submitAnswer(100L, 1L, request);

            assertFalse(response.isCorrect());
            assertEquals(201L, response.correctOptionId());
            assertEquals(0, response.scoreCalculation().pointsAwarded());
            assertEquals(0, response.scoreCalculation().currentStreak());
            assertEquals(1.0, response.scoreCalculation().streakMultiplier(), 0.001);
            assertEquals(0, response.gameProgress().currentStreak());
            assertEquals(1, activePartida.getErrores());
        }

        @Test
        @DisplayName("Timeout por exceder tiempo nominal + buffer de latencia (> 16500ms): 0 puntos y racha rota")
        void testSubmitAnswerTimeoutExceeded() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));
            when(respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(100L, 100L)).thenReturn(false);
            when(preguntaRepository.findById(100L)).thenReturn(Optional.of(mockQuestion));

            RespuestaUsuario prevAnswer = new RespuestaUsuario();
            prevAnswer.setRachaMomento(3);
            when(respuestasUsuarioRepository.findTopByPartidaIdOrderByRespondidaEnDesc(100L))
                .thenReturn(Optional.of(prevAnswer));

            when(opcionRespuestaRepository.findByPreguntaIdAndEsCorrectaTrue(100L)).thenReturn(Optional.of(correctOption));
            when(respuestasUsuarioRepository.countByPartidaId(100L)).thenReturn(1L);

            // 17000 ms > 15000 + 1500 ms -> Timeout
            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 201L, 17000);
            SubmitAnswerResponse response = gameService.submitAnswer(100L, 1L, request);

            assertFalse(response.isCorrect());
            assertEquals(0, response.scoreCalculation().pointsAwarded());
            assertEquals(0, response.scoreCalculation().currentStreak());
            assertEquals(1, activePartida.getErrores());
        }

        @Test
        @DisplayName("Timeout explícito cuando selectedOptionId es null")
        void testSubmitAnswerExplicitTimeoutNullOption() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));
            when(respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(100L, 100L)).thenReturn(false);
            when(preguntaRepository.findById(100L)).thenReturn(Optional.of(mockQuestion));

            when(respuestasUsuarioRepository.findTopByPartidaIdOrderByRespondidaEnDesc(100L))
                .thenReturn(Optional.empty());
            when(opcionRespuestaRepository.findByPreguntaIdAndEsCorrectaTrue(100L)).thenReturn(Optional.of(correctOption));
            when(respuestasUsuarioRepository.countByPartidaId(100L)).thenReturn(1L);

            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, null, 15000);
            SubmitAnswerResponse response = gameService.submitAnswer(100L, 1L, request);

            assertFalse(response.isCorrect());
            assertEquals(0, response.scoreCalculation().pointsAwarded());
            assertEquals(0, response.scoreCalculation().currentStreak());
        }

        @Test
        @DisplayName("Rechazo con 409 Conflict si la pregunta ya fue respondida en la partida")
        void testSubmitAnswerConflictIfAlreadyAnswered() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));
            when(respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(100L, 100L)).thenReturn(true);

            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 201L, 3000);
            assertThrows(ConflictException.class, () -> gameService.submitAnswer(100L, 1L, request));
            verify(respuestasUsuarioRepository, never()).save(any());
        }

        @Test
        @DisplayName("Rechazo con 403 Forbidden si el jugador intenta responder partida de otro usuario")
        void testSubmitAnswerForbiddenForOtherUser() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));

            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 201L, 3000);
            // activePartida pertenece a user 1L, enviamos con userId 99L
            assertThrows(ForbiddenException.class, () -> gameService.submitAnswer(100L, 99L, request));
        }

        @Test
        @DisplayName("Rechazo y estado ABANDONED si la partida superó los 10 minutos de inactividad")
        void testSubmitAnswerAbandonedAfterTenMinutes() {
            activePartida.setTiempoInicio(Instant.now().minus(11, ChronoUnit.MINUTES));
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));

            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 201L, 3000);
            assertThrows(BadRequestException.class, () -> gameService.submitAnswer(100L, 1L, request));
            assertEquals(EstadoPartida.ABANDONED, activePartida.getEstado());
            verify(partidaRepository).save(activePartida);
        }

        @Test
        @DisplayName("Al responder la última pregunta (10/10) la partida cambia a COMPLETED automáticamente")
        void testSubmitAnswerCompletesGameOnLastQuestion() {
            when(partidaRepository.findById(100L)).thenReturn(Optional.of(activePartida));
            when(respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(100L, 100L)).thenReturn(false);
            when(preguntaRepository.findById(100L)).thenReturn(Optional.of(mockQuestion));
            when(respuestasUsuarioRepository.findTopByPartidaIdOrderByRespondidaEnDesc(100L)).thenReturn(Optional.empty());
            when(opcionRespuestaRepository.findByIdAndPreguntaId(201L, 100L)).thenReturn(Optional.of(correctOption));
            when(opcionRespuestaRepository.findByPreguntaIdAndEsCorrectaTrue(100L)).thenReturn(Optional.of(correctOption));
            when(respuestasUsuarioRepository.countByPartidaId(100L)).thenReturn(10L); // 10 de 10

            SubmitAnswerRequest request = new SubmitAnswerRequest(100L, 201L, 2500);
            gameService.submitAnswer(100L, 1L, request);

            assertEquals(EstadoPartida.COMPLETED, activePartida.getEstado());
            assertNotNull(activePartida.getTiempoFin());
        }
    }

    @Nested
    @DisplayName("Pruebas de Cierre de Partida (finishGame)")
    class FinishGameTests {

        @Test
        @DisplayName("Finaliza partida correctamente y calcula métricas y precisión")
        void testFinishGameSuccess() {
            Partida partida = new Partida(200L, mockUser, mockCategory, ModoPartida.RAPIDA, EstadoPartida.IN_PROGRESS);
            partida.setTiempoInicio(Instant.now().minus(90, ChronoUnit.SECONDS));
            partida.setPuntajeTotal(2500);
            partida.setAciertos(8);
            partida.setErrores(2);
            partida.setRachaMaxima(5);

            when(partidaRepository.findById(200L)).thenReturn(Optional.of(partida));
            when(rankingRepository.findUserGlobalRanking(1L)).thenReturn(Optional.empty());
            when(rankingRepository.findUserWeeklyRanking(1L)).thenReturn(Optional.empty());
            when(partidaRepository.findMaxScoreByUsuarioIdAndEstado(1L, EstadoPartida.COMPLETED)).thenReturn(2000);

            FinishGameResponse response = gameService.finishGame(200L, 1L);

            assertNotNull(response);
            assertEquals(200L, response.gameId());
            assertEquals("COMPLETED", response.status());
            assertEquals(2500, response.finalScore());
            assertEquals(8, response.correctAnswers());
            assertEquals(2, response.incorrectAnswers());
            assertEquals(5, response.maxStreak());
            assertEquals(80.0, response.accuracyPercentage());
            assertTrue(response.leaderboardUpdate().isPersonalBest());
            verify(partidaRepository).save(partida);
        }
    }
}
