package com.backend.dto.admin;

import com.backend.model.Role;

import java.time.Instant;

public record AdminUserResponse(
        Long id,
        String fullName,
        String email,
        String phone,
        String gender,
        Role role,
        boolean enabled,
        boolean emailVerified,
        boolean googleAccount,
        Instant createdAt,
        Instant updatedAt
) {
}