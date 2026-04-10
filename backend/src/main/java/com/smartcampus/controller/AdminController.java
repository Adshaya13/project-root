package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
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
            @RequestParam(value = "role", required = false) String role) {

        List<User> users = resolveUsersByRole(role);
        List<Map<String, Object>> response = users.stream()
            .map(user -> {
                Map<String, Object> item = new HashMap<>();
                item.put("user_id", user.getId());
                item.put("id", user.getId());
                item.put("name", user.getName());
                item.put("email", user.getEmail());
                item.put("role", user.getRole() == null ? null : user.getRole().name());
                return item;
            })
                .toList();

        return ResponseEntity.ok(ApiResponse.success(response, "Retrieved " + response.size() + " users"));
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
}
