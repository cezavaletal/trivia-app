package com.trivia.dto.category;

public record CategoryDto(
    Long id,
    String name,
    String slug,
    String description,
    String icon,
    String color,
    Long totalQuestions
) {}
