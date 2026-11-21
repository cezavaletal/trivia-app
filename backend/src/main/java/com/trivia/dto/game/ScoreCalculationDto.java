package com.trivia.dto.game;

public record ScoreCalculationDto(
    Integer baseScore,
    Integer speedBonus,
    Integer currentStreak,
    Double streakMultiplier,
    Integer pointsAwarded
) {}
