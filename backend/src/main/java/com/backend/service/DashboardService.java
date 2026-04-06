package com.backend.service;

import com.backend.dto.dashboard.ActionResponse;
import com.backend.dto.dashboard.DashboardResponse;
import com.backend.dto.dashboard.MetricResponse;
import com.backend.model.Role;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class DashboardService {

    public DashboardResponse buildDashboard(Role role, String displayName) {
        return switch (role) {
            case ADMIN -> new DashboardResponse(
                    role.name().toLowerCase(),
                    "Admin command center",
                    "Oversee users, approvals, and institutional activity from a single control room.",
                    List.of(
                            new MetricResponse("Active users", "2,438", "+12% this month"),
                            new MetricResponse("Pending approvals", "18", "8 require review"),
                            new MetricResponse("Security alerts", "3", "2 resolved today")
                    ),
                    List.of(
                            "Default admin access is seeded from backend env so you always have a superuser to test with.",
                            "JWT sessions are stateless and role-aware, so dashboard navigation stays consistent across refreshes."
                    ),
                    List.of(
                            new ActionResponse("Review signups", "Approve pending staff and student registrations.", "/dashboard/admin"),
                            new ActionResponse("Export audit log", "Pull the latest security and access report.", "/dashboard/admin")
                    )
            );
            case STUDENT -> new DashboardResponse(
                    role.name().toLowerCase(),
                    "Student dashboard",
                    "Track coursework, announcements, and the actions that matter most to your semester.",
                    List.of(
                            new MetricResponse("Courses enrolled", "6", "2 assignments due this week"),
                            new MetricResponse("Attendance", "94%", "Above program average"),
                            new MetricResponse("Unread messages", "7", "3 from instructors")
                    ),
                    List.of(
                            "Registration for students goes through email OTP verification before the account is activated.",
                            "Password resets use the same six-digit email flow for consistency and security."
                    ),
                    List.of(
                            new ActionResponse("Open timetable", "See today’s lectures and labs.", "/dashboard/student"),
                            new ActionResponse("Submit assignment", "Upload the next graded milestone.", "/dashboard/student")
                    )
            );
            case STAFF -> new DashboardResponse(
                    role.name().toLowerCase(),
                    "Staff workspace",
                    "Manage teaching duties, review requests, and keep your department moving.",
                    List.of(
                            new MetricResponse("Classes today", "4", "2 require attendance updates"),
                            new MetricResponse("Student requests", "11", "5 waiting on approval"),
                            new MetricResponse("Tasks completed", "26", "This week")
                    ),
                    List.of(
                            "Staff accounts can self-register with role-aware onboarding and OTP confirmation.",
                            "Google sign-in is scaffolded so you can wire provider tokens into the same JWT session layer."
                    ),
                    List.of(
                            new ActionResponse("Review requests", "Approve extensions and department approvals.", "/dashboard/staff"),
                            new ActionResponse("Publish update", "Send an announcement to your classes.", "/dashboard/staff")
                    )
            );
        };
    }
}