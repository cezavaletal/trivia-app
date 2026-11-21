package com.trivia.dto.auth;

public record AuthResponse(
    String tokenType,
    String accessToken,
    long expiresInSeconds,
    UserSummaryDto user
) {
    public static AuthResponse of(String token, long expiresInSeconds, UserSummaryDto user) {
        return new AuthResponse("Bearer", token, expiresInSeconds, user);
    }
}
