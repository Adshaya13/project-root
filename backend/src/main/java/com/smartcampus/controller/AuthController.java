package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.model.User;
import com.smartcampus.security.JwtTokenProvider;
import com.smartcampus.repository.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

        private final UserRepository userRepository;
        private final JwtTokenProvider jwtTokenProvider;
        private final PasswordEncoder passwordEncoder;

        @PostMapping("/register")
        public ResponseEntity<ApiResponse<Map<String, Object>>> register(
                        @Valid @RequestBody RegisterRequest request) {

                String email = request.email().trim().toLowerCase();
                if (userRepository.existsByEmail(email)) {
                        return ResponseEntity.status(HttpStatus.CONFLICT)
                                        .body(ApiResponse.error("Email is already registered"));
                }

                User.Role selectedRole = parsePublicRole(request.role());
                if (selectedRole == null) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("Role must be USER or TECHNICIAN"));
                }

                User user = User.builder()
                                .email(email)
                                .name(request.name().trim())
                                .passwordHash(passwordEncoder.encode(request.password()))
                                .authProvider(User.AuthProvider.LOCAL)
                                .role(selectedRole)
                                .active(true)
                                .build();

                userRepository.save(user);

                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
                Map<String, Object> payload = authPayload(user, token, false);

                return ResponseEntity.ok()
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .body(ApiResponse.success(payload, "Registration successful"));
        }

        @PostMapping("/login")
        public ResponseEntity<ApiResponse<Map<String, Object>>> login(
                        @Valid @RequestBody LoginRequest request) {

                String email = request.email().trim().toLowerCase();
                User user = userRepository.findByEmail(email).orElse(null);

                if (user == null || !user.isActive()) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(ApiResponse.error("Invalid email or password"));
                }

                if (user.getAuthProvider() == User.AuthProvider.GOOGLE
                                && (user.getPasswordHash() == null || user.getPasswordHash().isBlank())) {
                        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                        .body(ApiResponse.error("This account uses Google sign-in"));
                }

                if (user.getPasswordHash() == null
                                || !passwordEncoder.matches(request.password(), user.getPasswordHash())) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(ApiResponse.error("Invalid email or password"));
                }

                String roleClaim = user.getRole() == null ? "" : user.getRole().name();
                String token = jwtTokenProvider.generateToken(user.getEmail(), roleClaim);
                Map<String, Object> payload = authPayload(user, token, user.getRole() == null);

                return ResponseEntity.ok()
                                .header(HttpHeaders.AUTHORIZATION, "Bearer " + token)
                                .body(ApiResponse.success(payload, "Login successful"));
        }

        @GetMapping("/me")
        public ResponseEntity<ApiResponse<Map<String, Object>>> getCurrentUser(
                        Authentication authentication,
                        @RequestHeader(value = HttpHeaders.AUTHORIZATION, required = false) String authHeader) {

                if (authentication == null || authentication.getName() == null) {
                        return ResponseEntity.status(401)
                                        .body(ApiResponse.error("Not authenticated"));
                }

                String email = authentication.getName();
                User user = userRepository.findByEmail(email).orElse(null);

                if (user == null) {
                        return ResponseEntity.status(404)
                                        .body(ApiResponse.error("User not found"));
                }

                String token = null;
                if (authHeader != null && authHeader.startsWith("Bearer ")) {
                        token = authHeader.substring(7);
                }

                Map<String, Object> userInfo = authPayload(user, token, user.getRole() == null);

                return ResponseEntity.ok(ApiResponse.success(userInfo));
        }

        @PutMapping("/role")
        public ResponseEntity<ApiResponse<Map<String, Object>>> updateRole(
                        Authentication authentication,
                        @RequestBody Map<String, String> body) {

                if (authentication == null || authentication.getName() == null) {
                        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                                        .body(ApiResponse.error("Not authenticated"));
                }

                String email = authentication.getName();
                User user = userRepository.findByEmail(email)
                                .orElseThrow(() -> new RuntimeException("User not found"));

                String roleStr = body.get("role");
                User.Role newRole = parsePublicRole(roleStr);
                if (newRole == null) {
                        return ResponseEntity.badRequest()
                                        .body(ApiResponse.error("Invalid role. Allowed values: USER, TECHNICIAN"));
                }

                user.setRole(newRole);
                userRepository.save(user);
                log.info("Role updated for user {} to {}", email, newRole);

                String token = jwtTokenProvider.generateToken(user.getEmail(), user.getRole().name());
                Map<String, Object> userInfo = authPayload(user, token, false);

                return ResponseEntity.ok(
                                ApiResponse.success(userInfo, "Role updated successfully"));
        }

        @PostMapping("/logout")
        public ResponseEntity<ApiResponse<Void>> logout() {
                return ResponseEntity.ok(ApiResponse.success(null, "Logged out"));
        }

        private User.Role parsePublicRole(String roleRaw) {
                if (roleRaw == null) {
                        return null;
                }

                try {
                        User.Role parsed = User.Role.valueOf(roleRaw.trim().toUpperCase());
                        if (parsed == User.Role.USER || parsed == User.Role.TECHNICIAN) {
                                return parsed;
                        }
                } catch (IllegalArgumentException ignored) {
                        return null;
                }

                return null;
        }

        private Map<String, Object> authPayload(User user, String token, boolean needsRoleSelection) {
                return Map.of(
                                "id", user.getId() == null ? "" : user.getId(),
                                "name", user.getName() == null ? "" : user.getName(),
                                "email", user.getEmail() == null ? "" : user.getEmail(),
                                "avatarUrl", user.getAvatarUrl() == null ? "" : user.getAvatarUrl(),
                                "role", user.getRole() == null ? "" : user.getRole().name(),
                                "token", token == null ? "" : token,
                                "needsRoleSelection", needsRoleSelection);
        }

        private record RegisterRequest(
                        @NotBlank String name,
                        @NotBlank @Email String email,
                        @NotBlank String password,
                        @NotBlank String role) {
        }

        private record LoginRequest(
                        @NotBlank @Email String email,
                        @NotBlank String password) {
        }
}
