package com.backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateProfileRequest(
        @NotBlank(message = "Full name cannot be blank")
        @Size(min = 2, max = 255, message = "Full name must be between 2 and 255 characters")
        String fullName,

        @NotBlank(message = "Phone cannot be blank")
        @Size(min = 7, max = 20, message = "Phone must be between 7 and 20 characters")
        String phone,

        @NotBlank(message = "Gender cannot be blank")
        String gender
) {
}
