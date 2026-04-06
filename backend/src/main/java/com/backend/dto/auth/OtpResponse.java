package com.backend.dto.auth;

import java.time.Instant;

public record OtpResponse(
        String message,
        String email,
        Instant expiresAt
) {
}