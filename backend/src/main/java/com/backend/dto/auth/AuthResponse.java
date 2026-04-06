package com.backend.dto.auth;

import java.time.Instant;

public record AuthResponse(
        String token,
        Instant expiresAt,
        UserResponse user,
        boolean newlyCreated
) {
}