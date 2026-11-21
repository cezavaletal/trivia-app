package com.trivia.dto.leaderboard;

public record GlobalPlayerDto(
    Long rank,
    Long userId,
    String username,
    Long totalScore,
    Integer gamesPlayed,
    Double accuracyPercentage,
    String badge
) {}
