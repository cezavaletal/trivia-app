package com.trivia.dto.game;

import jakarta.validation.constraints.NotNull;

public record SubmitAnswerRequest(
    @NotNull(message = "El id de la pregunta es obligatorio")
    Long questionId,

    Long selectedOptionId,

    Integer clientDurationMs
) {}
