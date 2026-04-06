package com.backend.dto.dashboard;

public record ActionResponse(
        String label,
        String description,
        String href
) {
}