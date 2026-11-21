package com.trivia.dto.leaderboard;

public record CategoryPlayerDto(
    Long rank,
    Long userId,
    String username,
    Long score
) {}
