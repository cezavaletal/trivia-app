package com.trivia.dto.game;

/**
 * DTO Sanitizado para entrega de opciones al jugador.
 * NUNCA expone esCorrecta ni isCorrect.
 */
public record AnswerOptionPublicDto(
    Long id,
    String text
) {}
