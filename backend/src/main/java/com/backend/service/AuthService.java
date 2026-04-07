package com.backend.service;

import com.backend.dto.auth.AuthResponse;
import com.backend.dto.auth.ForgotPasswordRequest;
import com.backend.dto.auth.GoogleAuthRequest;
import com.backend.dto.auth.LoginRequest;
import com.backend.dto.auth.OtpResponse;
import com.backend.dto.auth.ResetPasswordRequest;
import com.backend.dto.auth.SignupOtpRequest;
import com.backend.dto.auth.UserResponse;
import com.backend.dto.auth.VerifySignupRequest;
import com.backend.exception.ApiException;
import com.backend.model.OtpPurpose;
import com.backend.model.Role;
import com.backend.model.User;
import com.backend.repository.UserRepository;
import com.backend.security.JwtService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.UUID;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final OtpService otpService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final ObjectMapper objectMapper;
    private final GoogleIdentityService googleIdentityService;

    public AuthService(
            UserRepository userRepository,
            OtpService otpService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            ObjectMapper objectMapper,
            GoogleIdentityService googleIdentityService
    ) {
        this.userRepository = userRepository;
        this.otpService = otpService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.objectMapper = objectMapper;
        this.googleIdentityService = googleIdentityService;
    }

    public OtpResponse requestRegistrationOtp(SignupOtpRequest request) {
        String email = normalize(request.email());
        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists for that email");
        }

        PendingRegistrationPayload payload = new PendingRegistrationPayload(
                request.fullName().trim(),
                email,
                request.phone().trim(),
                request.gender().trim(),
                request.role(),
                passwordEncoder.encode(request.password())
        );

        otpService.issueOtp(email, OtpPurpose.REGISTRATION, serialize(payload));
        return new OtpResponse("Verification code sent", email, Instant.now().plusSeconds(600));
    }

    public AuthResponse verifyRegistrationOtp(VerifySignupRequest request) {
        String email = normalize(request.email());
        var token = otpService.verifyOtp(email, OtpPurpose.REGISTRATION, request.otp());
        PendingRegistrationPayload payload = deserialize(token.getPayloadJson());

        if (userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account already exists for that email");
        }

        User user = new User();
        user.setFullName(payload.fullName());
        user.setEmail(payload.email());
        user.setPhone(payload.phone());
        user.setGender(payload.gender());
        user.setRole(payload.role());
        user.setPasswordHash(payload.passwordHash());
        user.setEmailVerified(true);
        user.setGoogleAccount(false);

        User saved = userRepository.save(user);
        return issueSession(saved, true);
    }

    public AuthResponse login(LoginRequest request) {
        String email = normalize(request.email());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));

        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account has been restricted");
        }

        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }

        return issueSession(user, false);
    }

    public OtpResponse requestPasswordResetOtp(ForgotPasswordRequest request) {
        String email = normalize(request.email());
        if (!userRepository.existsByEmail(email)) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Email is not registered");
        }

        otpService.issueOtp(email, OtpPurpose.PASSWORD_RESET, null);
        return new OtpResponse("Reset code sent", email, Instant.now().plusSeconds(600));
    }

    public AuthResponse resetPassword(ResetPasswordRequest request) {
        String email = normalize(request.email());
        otpService.verifyOtp(email, OtpPurpose.PASSWORD_RESET, request.otp());

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "No user found for that email"));

        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account has been restricted");
        }

        user.setPasswordHash(passwordEncoder.encode(request.newPassword()));
        user.setEmailVerified(true);
        User saved = userRepository.save(user);
        return issueSession(saved, false);
    }

    public AuthResponse googleAuth(GoogleAuthRequest request) {
        Role role = request.role();
        if (role == Role.ADMIN) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Google sign-in is available for student and staff accounts only");
        }

        GoogleIdentityService.GoogleIdentity googleIdentity = googleIdentityService.verifyAccessToken(request.accessToken());
        String email = normalize(googleIdentity.email());

        User user = userRepository.findByEmail(email).orElseGet(() -> {
            User created = new User();
            created.setEmail(email);
            created.setFullName(googleIdentity.name());
            created.setPhone("+0000000000");
            created.setGender("unspecified");
            created.setRole(role);
            created.setPasswordHash(passwordEncoder.encode(UUID.randomUUID().toString()));
            created.setEmailVerified(true);
            created.setGoogleAccount(true);
            created.setGoogleSubject(googleIdentity.subject());
            return created;
        });
        boolean newlyCreated = user.getId() == null;

        if (!user.isEnabled()) {
            throw new ApiException(HttpStatus.FORBIDDEN, "This account has been restricted");
        }

        user.setFullName(googleIdentity.name());
        user.setGoogleAccount(true);
        user.setEmailVerified(true);
        user.setGoogleSubject(googleIdentity.subject());
        if (user.getRole() == null) {
            user.setRole(role);
        }

        return issueSession(userRepository.save(user), newlyCreated);
    }

    public UserResponse me(String email) {
        return toUserResponse(userRepository.findByEmail(normalize(email))
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found")));
    }

    private AuthResponse issueSession(User user, boolean newlyCreated) {
        String token = jwtService.generateToken(user);
        return new AuthResponse(token, jwtService.extractExpiration(token), toUserResponse(user), newlyCreated);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getGender(),
                user.getRole(),
                user.isEmailVerified(),
                user.isGoogleAccount(),
                user.getCreatedAt()
        );
    }

    private String normalize(String email) {
        return email.trim().toLowerCase();
    }

    private String serialize(PendingRegistrationPayload payload) {
        try {
            return objectMapper.writeValueAsString(payload);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to store registration payload");
        }
    }

    private PendingRegistrationPayload deserialize(String payloadJson) {
        try {
            return objectMapper.readValue(payloadJson, PendingRegistrationPayload.class);
        } catch (JsonProcessingException exception) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to restore registration payload");
        }
    }

    private record PendingRegistrationPayload(
            String fullName,
            String email,
            String phone,
            String gender,
            Role role,
            String passwordHash
    ) {
    }
}