package com.trivia.dto.auth;

public record UserStatsDto(
    long gamesPlayed,
    int highestScore,
    int totalCorrectAnswers,
    int bestStreak
) {}
