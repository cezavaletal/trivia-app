package com.trivia.dto.leaderboard;

public record CurrentUserRankDto(
    Long rank,
    Long userId,
    String username,
    Long totalScore,
    Integer gamesPlayed,
    Double winRate,
    Long score
) {
    public static CurrentUserRankDto ofGlobal(Long rank, Long userId, String username, Long totalScore, Integer gamesPlayed, Double winRate) {
        return new CurrentUserRankDto(rank, userId, username, totalScore, gamesPlayed, winRate, totalScore);
    }

    public static CurrentUserRankDto ofScoped(Long rank, Long userId, String username, Long score) {
        return new CurrentUserRankDto(rank, userId, username, score, null, null, score);
    }
}
