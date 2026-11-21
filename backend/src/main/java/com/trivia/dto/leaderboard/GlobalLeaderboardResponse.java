package com.trivia.dto.leaderboard;

public record GlobalLeaderboardResponse(
    CurrentUserRankDto currentUserRank,
    PageResponse<GlobalPlayerDto> topPlayers
) {}
