package com.trivia.dto.leaderboard;

public record WeeklyPlayerDto(
    Long rank,
    Long userId,
    String username,
    Long score,
    String badge
) {}
