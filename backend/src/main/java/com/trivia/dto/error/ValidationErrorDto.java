package com.trivia.dto.error;

public record ValidationErrorDto(
    String field,
    Object rejectedValue,
    String message
) {}
