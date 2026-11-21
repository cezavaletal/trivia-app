package com.trivia.dto.game;

public record LeaderboardUpdateDto(
    Long globalRank,
    Long weeklyRank,
    Boolean isPersonalBest
) {}
