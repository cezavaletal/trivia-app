package com.trivia.dto.game;

public record StartGameRequest(
    String gameMode,
    Long categoryId
) {}
