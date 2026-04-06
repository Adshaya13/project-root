package com.backend.dto.dashboard;

import java.util.List;

public record DashboardResponse(
        String role,
        String title,
        String subtitle,
        List<MetricResponse> metrics,
        List<String> announcements,
        List<ActionResponse> actions
) {
}