package com.backend.service;

import com.backend.exception.ApiException;
import com.backend.model.OtpPurpose;
import com.backend.model.OtpToken;
import com.backend.repository.OtpTokenRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration OTP_TTL = Duration.ofMinutes(10);

    private final OtpTokenRepository otpTokenRepository;
    private final MailService mailService;

    public OtpService(OtpTokenRepository otpTokenRepository, MailService mailService) {
        this.otpTokenRepository = otpTokenRepository;
        this.mailService = mailService;
    }

    public OtpToken issueOtp(String email, OtpPurpose purpose, String payloadJson) {
        otpTokenRepository.deleteByEmailAndPurpose(email, purpose);

        OtpToken token = new OtpToken();
        token.setEmail(email.toLowerCase());
        token.setPurpose(purpose);
        token.setCode(generateOtp());
        token.setPayloadJson(payloadJson);
        token.setExpiresAt(Instant.now().plus(OTP_TTL));
        OtpToken saved = otpTokenRepository.save(token);

        String subject = purpose == OtpPurpose.REGISTRATION ? "Verify your CampusFlow account" : "Reset your CampusFlow password";
        String body = "Your verification code is " + saved.getCode() + "\n\nThis code expires in 10 minutes. If you did not request it, ignore this email.";
        mailService.sendOtp(email, subject, body);
        return saved;
    }

    public OtpToken verifyOtp(String email, OtpPurpose purpose, String otp) {
        OtpToken token = otpTokenRepository.findFirstByEmailAndPurposeOrderByCreatedAtDesc(email.toLowerCase(), purpose)
                .orElseThrow(() -> new ApiException(HttpStatus.BAD_REQUEST, "OTP not found for this email"));

        if (token.getConsumedAt() != null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP has already been used");
        }
        if (token.getExpiresAt().isBefore(Instant.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "OTP has expired");
        }
        if (!token.getCode().equals(otp)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid OTP code");
        }

        token.setConsumedAt(Instant.now());
        return otpTokenRepository.save(token);
    }

    private String generateOtp() {
        int code = RANDOM.nextInt(900000) + 100000;
        return String.valueOf(code);
    }
}