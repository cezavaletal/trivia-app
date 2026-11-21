package com.trivia.dto.auth;

import java.util.List;

public record UserProfileResponse(
    Long id,
    String username,
    String email,
    List<String> roles,
    UserStatsDto stats
) {}
