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
}
