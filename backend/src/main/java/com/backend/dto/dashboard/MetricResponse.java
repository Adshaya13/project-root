package com.backend.dto.dashboard;

public record MetricResponse(
        String label,
        String value,
        String helper
) {
}