package com.trivia.dto.game;

public record SubmitAnswerResponse(
    Long questionId,
    Boolean isCorrect,
    Long correctOptionId,
    String explanation,
    ScoreCalculationDto scoreCalculation,
    GameProgressDto gameProgress
) {}
