package com.trivia.dto.auth;

import java.time.Instant;
import java.util.List;

public record UserSummaryDto(
    Long id,
    String username,
    String email,
    List<String> roles,
    Instant createdAt
) {}
