package com.trivia.dto.game;

import java.time.Instant;
import java.util.List;

public record StartGameResponse(
    Long gameId,
    String gameMode,
    String status,
    Integer totalQuestions,
    Integer totalScore,
    Integer currentStreak,
    Instant createdAt,
    List<QuestionPublicDto> questions
) {}
