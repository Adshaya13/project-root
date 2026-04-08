package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import com.smartcampus.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:3000")
public class AuthController {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    // GET /api/auth/me - get current logged in user profile
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
            @AuthenticationPrincipal OAuth2User oAuth2User) {

        if (oAuth2User == null) {
            return ResponseEntity.status(401)
                    .body(ApiResponse.error("Not authenticated"));
        }

        String email = oAuth2User.getAttribute("email");
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            return ResponseEntity.status(404)
                    .body(ApiResponse.error("User not found"));
        }

        Map<String, Object> userInfo = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
                "role", user.getRole().name()
        );

        return ResponseEntity.ok(ApiResponse.success(userInfo));
    }

    // PUT /api/auth/role - set role after role selection screen
    @PutMapping("/role")
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateRole(
            @AuthenticationPrincipal OAuth2User oAuth2User,
            @RequestBody Map<String, String> body) {

        String email = oAuth2User.getAttribute("email");
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String roleStr = body.get("role");
        try {
            User.Role newRole = User.Role.valueOf(roleStr.toUpperCase());
            user.setRole(newRole);
            userRepository.save(user);
            log.info("Role updated for user {} to {}", email, newRole);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest()
                    .body(ApiResponse.error("Invalid role: " + roleStr));
        }

        Map<String, Object> userInfo = Map.of(
                "id", user.getId(),
                "name", user.getName(),
                "email", user.getEmail(),
                "role", user.getRole().name()
        );

        return ResponseEntity.ok(
                ApiResponse.success(userInfo, "Role updated successfully"));
    }
}
