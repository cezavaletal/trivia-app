package com.trivia.dto.leaderboard;

public record CategoryLeaderboardResponse(
    Long categoryId,
    String categoryName,
    CurrentUserRankDto currentUserRank,
    PageResponse<CategoryPlayerDto> topPlayers
) {}
