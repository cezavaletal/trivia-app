package com.trivia.dto.game;

public record GameProgressDto(
    Integer totalScore,
    Integer currentStreak,
    Integer remainingQuestions
) {}
