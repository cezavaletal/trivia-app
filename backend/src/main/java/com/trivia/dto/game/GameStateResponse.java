package com.trivia.dto.game;

public record GameStateResponse(
    Long gameId,
    String status,
    Integer totalScore,
    Integer currentStreak,
    Integer answeredCount,
    Integer totalQuestions,
    Integer currentQuestionIndex
) {}
