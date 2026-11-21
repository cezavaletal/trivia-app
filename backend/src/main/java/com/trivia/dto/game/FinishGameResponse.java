package com.trivia.dto.game;

import java.time.Instant;

public record FinishGameResponse(
    Long gameId,
    String status,
    Integer finalScore,
    Integer correctAnswers,
    Integer incorrectAnswers,
    Integer maxStreak,
    Long totalDurationSeconds,
    Double accuracyPercentage,
    LeaderboardUpdateDto leaderboardUpdate,
    Instant completedAt
) {}
