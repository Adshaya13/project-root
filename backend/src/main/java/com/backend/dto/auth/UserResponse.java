package com.backend.dto.auth;

import com.backend.model.Role;

import java.time.Instant;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String gender,
        Role role,
        boolean emailVerified,
        boolean googleAccount,
        Instant createdAt
) {
}