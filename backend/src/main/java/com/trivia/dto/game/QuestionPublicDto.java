package com.trivia.dto.game;

import java.util.List;

/**
 * DTO Sanitizado para entrega de preguntas de partida al jugador.
 * NUNCA expone esCorrecta ni isCorrect ni explicacion.
 */
public record QuestionPublicDto(
    Long id,
    Integer order,
    String categoryName,
    String difficulty,
    Integer timeLimitSeconds,
    String text,
    List<AnswerOptionPublicDto> options
) {}
