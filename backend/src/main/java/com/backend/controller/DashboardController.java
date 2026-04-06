package com.backend.controller;

import com.backend.dto.dashboard.DashboardResponse;
import com.backend.model.Role;
import com.backend.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/me")
    public DashboardResponse me(Authentication authentication) {
        Role role = roleFromAuthentication(authentication);
        return dashboardService.buildDashboard(role, authentication.getName());
    }

    @GetMapping("/{role}")
    @PreAuthorize("hasRole('ADMIN') or hasRole('STUDENT') or hasRole('STAFF')")
    public DashboardResponse byRole(@PathVariable String role, Authentication authentication) {
        Role requestedRole = Role.valueOf(role.toUpperCase());
        Role currentRole = roleFromAuthentication(authentication);
        if (currentRole != Role.ADMIN && currentRole != requestedRole) {
            throw new org.springframework.security.access.AccessDeniedException("You do not have access to this dashboard");
        }

        return dashboardService.buildDashboard(requestedRole, authentication.getName());
    }

    private Role roleFromAuthentication(Authentication authentication) {
        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .map(authority -> Role.valueOf(authority.substring(5)))
                .orElseThrow(() -> new org.springframework.security.access.AccessDeniedException("Missing role"));
    }
}