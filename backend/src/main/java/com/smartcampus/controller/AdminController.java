package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UserRepository userRepository;

    public AdminController(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listUsers(
            @RequestParam(value = "role", required = false) String role,
            Authentication authentication) {

        // Verify admin access
        if (authentication == null || !hasAdminRole(authentication)) {
            throw new AccessDeniedException("Only ADMIN can list users");
        }

        List<User> users = resolveUsersByRole(role);
        List<Map<String, Object>> response = users.stream()
            .map(this::userToResponse)
            .toList();

        return ResponseEntity.ok(ApiResponse.success(response, "Retrieved " + response.size() + " users"));
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getUserDetails(
            @PathVariable String userId,
            Authentication authentication) {

        if (authentication == null || !hasAdminRole(authentication)) {
            throw new AccessDeniedException("Only ADMIN can view user details");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(ApiResponse.success(userToResponse(user), "User details retrieved"));
    }

    @PutMapping("/users/{userId}/status")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUserStatus(
            @PathVariable String userId,
            @RequestBody Map<String, String> request,
            Authentication authentication) {

        if (authentication == null || !hasAdminRole(authentication)) {
            throw new AccessDeniedException("Only ADMIN can update user status");
        }

        String status = request.get("status");
        if (status == null || status.isBlank()) {
            throw new BadRequestException("Status is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Prevent admin from changing their own status
        String adminEmail = authentication.getName();
        if (user.getEmail().equals(adminEmail) && "inactive".equalsIgnoreCase(status)) {
            throw new BadRequestException("Cannot deactivate your own admin account");
        }

        // Set user status (active/inactive)
        boolean isActive = "active".equalsIgnoreCase(status);
        user.setActive(isActive);
        
        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(userToResponse(updated), 
            "User status updated to " + status));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateUser(
            @PathVariable String userId,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        if (authentication == null || !hasAdminRole(authentication)) {
            throw new AccessDeniedException("Only ADMIN can edit users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String adminEmail = authentication.getName();
        boolean isSelf = user.getEmail() != null && user.getEmail().equalsIgnoreCase(adminEmail);

        String requestedName = normalizeBlank(asString(request.get("name")));
        String requestedEmail = normalizeEmail(asString(request.get("email")));
        String requestedRoleRaw = normalizeBlank(asString(request.get("role")));
        Boolean requestedActive = parseOptionalBoolean(request.get("active"), "active");

        boolean changed = false;

        if (requestedName != null && !Objects.equals(requestedName, user.getName())) {
            user.setName(requestedName);
            changed = true;
        }

        if (requestedEmail != null && !requestedEmail.equalsIgnoreCase(user.getEmail())) {
            if (isSelf) {
                throw new BadRequestException("Cannot change your own admin email");
            }
            if (userRepository.existsByEmail(requestedEmail)) {
                throw new BadRequestException("Email is already registered");
            }
            user.setEmail(requestedEmail);
            changed = true;
        }

        if (requestedRoleRaw != null) {
            User.Role requestedRole;
            try {
                requestedRole = User.Role.valueOf(requestedRoleRaw.toUpperCase(Locale.ROOT));
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Invalid role. Allowed values: USER, ADMIN, TECHNICIAN");
            }

            if (isSelf && requestedRole != User.Role.ADMIN) {
                throw new BadRequestException("Cannot remove ADMIN role from your own account");
            }

            if (user.getRole() != requestedRole) {
                user.setRole(requestedRole);
                changed = true;
            }
        }

        if (requestedActive != null && requestedActive != user.isActive()) {
            if (isSelf && !requestedActive) {
                throw new BadRequestException("Cannot deactivate your own admin account");
            }
            user.setActive(requestedActive);
            changed = true;
        }

        if (!changed) {
            throw new BadRequestException("No valid user changes provided");
        }

        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(userToResponse(updated), "User updated successfully"));
    }

    @PutMapping("/users/{userId}/suspend")
    public ResponseEntity<ApiResponse<Map<String, Object>>> suspendUser(
            @PathVariable String userId,
            Authentication authentication) {

        if (authentication == null || !hasAdminRole(authentication)) {
            throw new AccessDeniedException("Only ADMIN can suspend users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        // Prevent admin from suspending themselves
        String adminEmail = authentication.getName();
        if (user.getEmail().equals(adminEmail)) {
            throw new BadRequestException("Cannot suspend your own admin account");
        }

        user.setActive(false);
        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(userToResponse(updated), "User suspended"));
    }

    @PutMapping("/users/{userId}/activate")
    public ResponseEntity<ApiResponse<Map<String, Object>>> activateUser(
            @PathVariable String userId,
            Authentication authentication) {

        if (authentication == null || !hasAdminRole(authentication)) {
            throw new AccessDeniedException("Only ADMIN can activate users");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        user.setActive(true);
        User updated = userRepository.save(user);
        return ResponseEntity.ok(ApiResponse.success(userToResponse(updated), "User activated"));
    }

    private Map<String, Object> userToResponse(User user) {
        Map<String, Object> item = new HashMap<>();
        item.put("user_id", user.getId());
        item.put("id", user.getId());
        item.put("name", user.getName());
        item.put("email", user.getEmail());
        item.put("role", user.getRole() == null ? null : user.getRole().name());
        item.put("active", user.isActive());
        item.put("created_at", user.getCreatedAt());
        return item;
    }

    private List<User> resolveUsersByRole(String role) {
        if (role == null || role.isBlank()) {
            return userRepository.findAll();
        }

        try {
            User.Role parsedRole = User.Role.valueOf(role.trim().toUpperCase(Locale.ROOT));
            return userRepository.findByRole(parsedRole);
        } catch (IllegalArgumentException ex) {
            return List.of();
        }
    }

    private boolean hasAdminRole(Authentication authentication) {
        return authentication != null && authentication.getAuthorities().stream()
                .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN"));
    }

    private String asString(Object value) {
        return value instanceof String ? (String) value : null;
    }

    private Boolean parseOptionalBoolean(Object value, String fieldName) {
        if (value == null) {
            return null;
        }
        if (value instanceof Boolean boolValue) {
            return boolValue;
        }
        if (value instanceof String stringValue) {
            String normalized = stringValue.trim().toLowerCase(Locale.ROOT);
            if ("true".equals(normalized)) {
                return true;
            }
            if ("false".equals(normalized)) {
                return false;
            }
        }
        throw new BadRequestException(fieldName + " must be true or false");
    }

    private String normalizeEmail(String value) {
        String normalized = normalizeBlank(value);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
