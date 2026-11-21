package com.trivia.service;

import com.trivia.dto.game.*;
import com.trivia.entity.*;
import com.trivia.entity.enums.DificultadPregunta;
import com.trivia.entity.enums.EstadoPartida;
import com.trivia.entity.enums.ModoPartida;
import com.trivia.exception.*;
import com.trivia.repository.*;
import com.trivia.repository.projection.RankingGlobalProjection;
import com.trivia.repository.projection.RankingSemanalProjection;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.*;

@Service
public class GameService {

    private static final int DEFAULT_QUESTIONS_COUNT = 10;
    private static final int NOMINAL_TIME_LIMIT_MS = 15000;
    private static final int NETWORK_LATENCY_BUFFER_MS = 1500;
    private static final int MAX_GAME_DURATION_MINUTES = 10;

    private final PartidaRepository partidaRepository;
    private final PreguntaRepository preguntaRepository;
    private final OpcionRespuestaRepository opcionRespuestaRepository;
    private final RespuestaUsuarioRepository respuestasUsuarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaRepository categoriaRepository;
    private final RankingRepository rankingRepository;

    public GameService(
        PartidaRepository partidaRepository,
        PreguntaRepository preguntaRepository,
        OpcionRespuestaRepository opcionRespuestaRepository,
        RespuestaUsuarioRepository respuestasUsuarioRepository,
        UsuarioRepository usuarioRepository,
        CategoriaRepository categoriaRepository,
        RankingRepository rankingRepository
    ) {
        this.partidaRepository = partidaRepository;
        this.preguntaRepository = preguntaRepository;
        this.opcionRespuestaRepository = opcionRespuestaRepository;
        this.respuestasUsuarioRepository = respuestasUsuarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaRepository = categoriaRepository;
        this.rankingRepository = rankingRepository;
    }

    @Transactional
    public StartGameResponse startGame(Long userId, StartGameRequest request) {
        Usuario usuario = usuarioRepository.findById(userId)
            .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado"));

        String modeStr = request != null && request.gameMode() != null ? request.gameMode().trim().toUpperCase() : "QUICK_PLAY";
        ModoPartida modo;
        Categoria categoria = null;
        List<Pregunta> preguntas;

        if ("CATEGORY".equals(modeStr) || "CATEGORIA".equals(modeStr)) {
            modo = ModoPartida.CATEGORIA;
            if (request.categoryId() == null) {
                throw new BadRequestException("categoryId es obligatorio para iniciar partida en modo CATEGORY");
            }
            categoria = categoriaRepository.findById(request.categoryId())
                .filter(Categoria::getIsActive)
                .orElseThrow(() -> new ResourceNotFoundException("Categoría no encontrada o inactiva"));

            preguntas = preguntaRepository.findRandomActiveQuestionsByCategoria(categoria.getId(), DEFAULT_QUESTIONS_COUNT);
            if (preguntas.isEmpty()) {
                throw new InsufficientQuestionsException("No hay suficientes preguntas activas en el banco para la categoría seleccionada");
            }
        } else {
            modo = ModoPartida.RAPIDA;
            preguntas = preguntaRepository.findRandomActiveQuestions(DEFAULT_QUESTIONS_COUNT);
            if (preguntas.isEmpty()) {
                throw new InsufficientQuestionsException("No hay suficientes preguntas activas en el banco para crear la partida");
            }
        }

        Partida partida = new Partida();
        partida.setUsuario(usuario);
        partida.setCategoria(categoria);
        partida.setModo(modo);
        partida.setEstado(EstadoPartida.IN_PROGRESS);
        partida.setPuntajeTotal(0);
        partida.setAciertos(0);
        partida.setErrores(0);
        partida.setRachaMaxima(0);
        partida.setTiempoInicio(Instant.now());

        Partida saved = partidaRepository.save(partida);

        List<QuestionPublicDto> sanitizedQuestions = new ArrayList<>();
        int order = 1;
        for (Pregunta p : preguntas) {
            List<OpcionRespuesta> rawOptions = opcionRespuestaRepository.findByPreguntaId(p.getId());
            // SANITIZACIÓN ESTRICTA: Las opciones se entregan en AnswerOptionPublicDto (sin esCorrecta)
            List<AnswerOptionPublicDto> publicOptions = rawOptions.stream()
                .map(o -> new AnswerOptionPublicDto(o.getId(), o.getTexto()))
                .toList();

            sanitizedQuestions.add(new QuestionPublicDto(
                p.getId(),
                order++,
                p.getCategoria().getNombre(),
                mapDifficulty(p.getDificultad()),
                15,
                p.getEnunciado(),
                publicOptions
            ));
        }

        return new StartGameResponse(
            saved.getId(),
            modo.name(),
            saved.getEstado().name(),
            sanitizedQuestions.size(),
            saved.getPuntajeTotal(),
            0,
            saved.getTiempoInicio(),
            sanitizedQuestions
        );
    }

    @Transactional(readOnly = true)
    public GameStateResponse getGameState(Long gameId, Long userId) {
        Partida partida = partidaRepository.findById(gameId)
            .orElseThrow(() -> new ResourceNotFoundException("Partida no encontrada"));

        validateOwnership(partida, userId);

        long answeredCount = respuestasUsuarioRepository.countByPartidaId(gameId);
        int totalQuestions = getTotalQuestionsForGame(partida);
        int currentStreak = getLatestStreak(gameId);
        int currentQuestionIndex = Math.min(totalQuestions, (int) answeredCount + 1);

        return new GameStateResponse(
            partida.getId(),
            partida.getEstado().name(),
            partida.getPuntajeTotal(),
            currentStreak,
            (int) answeredCount,
            totalQuestions,
            currentQuestionIndex
        );
    }

    @Transactional
    public SubmitAnswerResponse submitAnswer(Long gameId, Long userId, SubmitAnswerRequest request) {
        Partida partida = partidaRepository.findById(gameId)
            .orElseThrow(() -> new ResourceNotFoundException("Partida no encontrada"));

        validateOwnership(partida, userId);

        if (partida.getEstado() != EstadoPartida.IN_PROGRESS) {
            throw new BadRequestException("La partida no se encuentra en curso (Estado: " + partida.getEstado() + ")");
        }

        if (Duration.between(partida.getTiempoInicio(), Instant.now()).toMinutes() >= MAX_GAME_DURATION_MINUTES) {
            partida.setEstado(EstadoPartida.ABANDONED);
            partida.setTiempoFin(Instant.now());
            partidaRepository.save(partida);
            throw new BadRequestException("La partida ha expirado por inactividad tras superar el tiempo límite global");
        }

        if (respuestasUsuarioRepository.existsByPartidaIdAndPreguntaId(gameId, request.questionId())) {
            throw new ConflictException("La pregunta ya fue respondida previamente dentro de esta partida");
        }

        Pregunta pregunta = preguntaRepository.findById(request.questionId())
            .orElseThrow(() -> new ResourceNotFoundException("Pregunta no encontrada"));

        int currentStreak = getLatestStreak(gameId);
        boolean isTimeout = false;
        int clientMs = request.clientDurationMs() != null ? request.clientDurationMs() : NOMINAL_TIME_LIMIT_MS;

        // Tolerancia de latencia de red: 15s + 1.5s = 16.5s
        if (clientMs > (NOMINAL_TIME_LIMIT_MS + NETWORK_LATENCY_BUFFER_MS)) {
            isTimeout = true;
        }

        OpcionRespuesta opcionSeleccionada = null;
        boolean isCorrect = false;
        int baseScore = 0;
        int speedBonus = 0;
        double streakMultiplier = 1.0;
        int pointsAwarded = 0;
        int newStreak = 0;

        if (request.selectedOptionId() != null && !isTimeout) {
            opcionSeleccionada = opcionRespuestaRepository.findByIdAndPreguntaId(request.selectedOptionId(), pregunta.getId())
                .orElseThrow(() -> new BadRequestException("La opción seleccionada no pertenece a la pregunta activa"));

            if (Boolean.TRUE.equals(opcionSeleccionada.getEsCorrecta())) {
                isCorrect = true;
                baseScore = getBaseScore(pregunta.getDificultad());
                speedBonus = calculateSpeedBonus(baseScore, clientMs, NOMINAL_TIME_LIMIT_MS);
                newStreak = currentStreak + 1;
                streakMultiplier = getStreakMultiplier(newStreak);
                pointsAwarded = (int) Math.floor((baseScore + speedBonus) * streakMultiplier);

                partida.setPuntajeTotal(partida.getPuntajeTotal() + pointsAwarded);
                partida.setAciertos(partida.getAciertos() + 1);
                partida.setRachaMaxima(Math.max(partida.getRachaMaxima(), newStreak));
            } else {
                partida.setErrores(partida.getErrores() + 1);
                newStreak = 0;
            }
        } else {
            // Timeout o sin respuesta
            partida.setErrores(partida.getErrores() + 1);
            newStreak = 0;
        }

        RespuestaUsuario respuestaUsuario = new RespuestaUsuario(
            null,
            partida,
            pregunta,
            opcionSeleccionada,
            isCorrect,
            pointsAwarded,
            clientMs,
            newStreak
        );
        respuestasUsuarioRepository.save(respuestaUsuario);

        int totalQuestions = getTotalQuestionsForGame(partida);
        long answeredCount = respuestasUsuarioRepository.countByPartidaId(partida.getId());
        int remainingQuestions = Math.max(0, totalQuestions - (int) answeredCount);

        if (answeredCount >= totalQuestions) {
            partida.setEstado(EstadoPartida.COMPLETED);
            partida.setTiempoFin(Instant.now());
        }

        partidaRepository.save(partida);

        Long correctOptionId = opcionRespuestaRepository.findByPreguntaIdAndEsCorrectaTrue(pregunta.getId())
            .map(OpcionRespuesta::getId)
            .orElse(null);

        ScoreCalculationDto scoreCalc = new ScoreCalculationDto(
            baseScore,
            speedBonus,
            newStreak,
            streakMultiplier,
            pointsAwarded
        );

        GameProgressDto gameProgress = new GameProgressDto(
            partida.getPuntajeTotal(),
            newStreak,
            remainingQuestions
        );

        return new SubmitAnswerResponse(
            pregunta.getId(),
            isCorrect,
            correctOptionId,
            pregunta.getExplicacion(),
            scoreCalc,
            gameProgress
        );
    }

    @Transactional
    public FinishGameResponse finishGame(Long gameId, Long userId) {
        Partida partida = partidaRepository.findById(gameId)
            .orElseThrow(() -> new ResourceNotFoundException("Partida no encontrada"));

        validateOwnership(partida, userId);

        if (partida.getEstado() != EstadoPartida.COMPLETED) {
            partida.setEstado(EstadoPartida.COMPLETED);
            if (partida.getTiempoFin() == null) {
                partida.setTiempoFin(Instant.now());
            }
            partidaRepository.save(partida);
        }

        int totalAnswers = partida.getAciertos() + partida.getErrores();
        double accuracy = totalAnswers > 0
            ? Math.round(((double) partida.getAciertos() / (double) totalAnswers) * 10000.0) / 100.0
            : 0.0;

        Instant end = partida.getTiempoFin() != null ? partida.getTiempoFin() : Instant.now();
        long totalDurationSeconds = Math.max(0, Duration.between(partida.getTiempoInicio(), end).toSeconds());

        Long globalRank = rankingRepository.findUserGlobalRanking(userId)
            .map(RankingGlobalProjection::getRank)
            .orElse(null);

        Long weeklyRank = rankingRepository.findUserWeeklyRanking(userId)
            .map(RankingSemanalProjection::getRank)
            .orElse(null);

        int maxScoreSoFar = partidaRepository.findMaxScoreByUsuarioIdAndEstado(userId, EstadoPartida.COMPLETED);
        boolean isPersonalBest = partida.getPuntajeTotal() >= maxScoreSoFar;

        LeaderboardUpdateDto leaderboardUpdate = new LeaderboardUpdateDto(
            globalRank,
            weeklyRank,
            isPersonalBest
        );

        return new FinishGameResponse(
            partida.getId(),
            partida.getEstado().name(),
            partida.getPuntajeTotal(),
            partida.getAciertos(),
            partida.getErrores(),
            partida.getRachaMaxima(),
            totalDurationSeconds,
            accuracy,
            leaderboardUpdate,
            end
        );
    }

    private void validateOwnership(Partida partida, Long userId) {
        if (!partida.getUsuario().getId().equals(userId)) {
            throw new ForbiddenException("La partida pertenece a otro usuario");
        }
    }

    private int getLatestStreak(Long partidaId) {
        return respuestasUsuarioRepository.findTopByPartidaIdOrderByRespondidaEnDesc(partidaId)
            .map(RespuestaUsuario::getRachaMomento)
            .orElse(0);
    }

    private int getTotalQuestionsForGame(Partida partida) {
        if (partida.getModo() == ModoPartida.CATEGORIA && partida.getCategoria() != null) {
            long count = preguntaRepository.countByCategoriaIdAndIsActiveTrue(partida.getCategoria().getId());
            return (int) Math.min(DEFAULT_QUESTIONS_COUNT, Math.max(1, count));
        }
        return DEFAULT_QUESTIONS_COUNT;
    }

    private int getBaseScore(DificultadPregunta dificultad) {
        if (dificultad == null) return 200;
        return switch (dificultad) {
            case FACIL -> 100;
            case MEDIA -> 200;
            case DIFICIL -> 300;
        };
    }

    private int calculateSpeedBonus(int baseScore, int clientMs, int totalMs) {
        int duration = Math.min(totalMs, Math.max(0, clientMs));
        int remaining = Math.max(0, totalMs - duration);
        return (int) Math.floor(baseScore * ((double) remaining / (double) totalMs) * 0.5);
    }

    private double getStreakMultiplier(int streak) {
        if (streak <= 1) return 1.0;
        if (streak == 2) return 1.2;
        if (streak == 3) return 1.4;
        if (streak == 4) return 1.7;
        return 2.0; // 5 or more
    }

    private String mapDifficulty(DificultadPregunta dificultad) {
        if (dificultad == null) return "MEDIUM";
        return switch (dificultad) {
            case FACIL -> "EASY";
            case MEDIA -> "MEDIUM";
            case DIFICIL -> "HARD";
        };
    }
}
