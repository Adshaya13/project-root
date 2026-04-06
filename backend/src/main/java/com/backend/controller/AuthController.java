package com.backend.controller;

import com.backend.dto.auth.AuthResponse;
import com.backend.dto.auth.ForgotPasswordRequest;
import com.backend.dto.auth.GoogleAuthRequest;
import com.backend.dto.auth.LoginRequest;
import com.backend.dto.auth.OtpResponse;
import com.backend.dto.auth.ResetPasswordRequest;
import com.backend.dto.auth.SignupOtpRequest;
import com.backend.dto.auth.UserResponse;
import com.backend.dto.auth.VerifySignupRequest;
import com.backend.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register/request-otp")
    public OtpResponse requestRegistrationOtp(@Valid @RequestBody SignupOtpRequest request) {
        return authService.requestRegistrationOtp(request);
    }

    @PostMapping("/register/verify")
    public AuthResponse verifyRegistrationOtp(@Valid @RequestBody VerifySignupRequest request) {
        return authService.verifyRegistrationOtp(request);
    }

    @PostMapping("/login")
    public AuthResponse login(@Valid @RequestBody LoginRequest request) {
        return authService.login(request);
    }

    @PostMapping("/forgot-password/request-otp")
    public OtpResponse requestPasswordResetOtp(@Valid @RequestBody ForgotPasswordRequest request) {
        return authService.requestPasswordResetOtp(request);
    }

    @PostMapping("/forgot-password/reset")
    public AuthResponse resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        return authService.resetPassword(request);
    }

    @PostMapping("/google")
    public AuthResponse googleAuth(@Valid @RequestBody GoogleAuthRequest request) {
        return authService.googleAuth(request);
    }

    @GetMapping("/me/{email}")
    public UserResponse me(@PathVariable String email) {
        return authService.me(email);
    }
}