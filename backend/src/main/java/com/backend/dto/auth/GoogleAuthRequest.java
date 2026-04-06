package com.backend.dto.auth;

import com.backend.model.Role;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record GoogleAuthRequest(
        @NotBlank @Email String email,
        @NotBlank String fullName,
        Role role,
        String googleSubject
) {
}