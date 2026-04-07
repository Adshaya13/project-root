package com.backend.dto.auth;

import com.backend.model.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record GoogleAuthRequest(
        @NotBlank String accessToken,
        @NotNull Role role
) {
}