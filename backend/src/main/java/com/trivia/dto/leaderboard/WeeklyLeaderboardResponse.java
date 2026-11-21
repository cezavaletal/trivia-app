package com.trivia.dto.leaderboard;

import java.time.Instant;

public record WeeklyLeaderboardResponse(
    Integer weekNumber,
    Integer year,
    Instant startsAt,
    Instant endsAt,
    CurrentUserRankDto currentUserRank,
    PageResponse<WeeklyPlayerDto> topPlayers
) {}
