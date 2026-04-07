package com.backend.service;

import com.backend.exception.ApiException;
import com.backend.model.OtpPurpose;
import com.backend.model.OtpToken;
import com.backend.repository.OtpTokenRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;

@Service
public class OtpService {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final Duration OTP_TTL = Duration.ofMinutes(10);

    private final OtpTokenRepository otpTokenRepository;
    private final MailService mailService;
    private final String appName;

    public OtpService(
            OtpTokenRepository otpTokenRepository,
            MailService mailService,
            @Value("${app.application-name:CampusFlow}") String appName
    ) {
        this.otpTokenRepository = otpTokenRepository;
        this.mailService = mailService;
        this.appName = appName;
    }

    @Transactional
    public OtpToken issueOtp(String email, OtpPurpose purpose, String payloadJson) {
        otpTokenRepository.deleteByEmailAndPurpose(email, purpose);

        OtpToken token = new OtpToken();
        token.setEmail(email.toLowerCase());
        token.setPurpose(purpose);
        token.setCode(generateOtp());
        token.setPayloadJson(payloadJson);
        token.setExpiresAt(Instant.now().plus(OTP_TTL));
        OtpToken saved = otpTokenRepository.save(token);

        EmailTemplate template = buildTemplate(email, saved.getCode(), purpose);
        mailService.sendEmail(email, template.subject(), template.textBody(), template.htmlBody());
        return saved;
    }

    @Transactional
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

        private EmailTemplate buildTemplate(String email, String otpCode, OtpPurpose purpose) {
                String subject;
                String title;
                String intro;

                if (purpose == OtpPurpose.REGISTRATION) {
                        subject = "Verify your " + appName + " account";
                        title = "Email Verification";
                        intro = "Thanks for registering with " + appName + ". Use this OTP to verify your email address.";
                } else {
                        subject = "Reset your " + appName + " password";
                        title = "Password Reset";
                        intro = "We received a request to reset your password. Use this OTP to continue.";
                }

                String textBody = title + "\n\n"
                                + intro + "\n\n"
                                + "OTP: " + otpCode + "\n"
                                + "Expires in 10 minutes.\n\n"
                                + "If you did not request this, you can ignore this email.\n"
                                + "Email: " + email + "\n"
                                + appName + " Security Team";

                String htmlBody = """
                                <!doctype html>
                                <html lang=\"en\">
                                <head>
                                    <meta charset=\"UTF-8\" />
                                    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\" />
                                    <title>%s</title>
                                </head>
                                <body style=\"margin:0;padding:24px;background:#f4f7fb;font-family:Segoe UI,Arial,sans-serif;color:#1f2937;\">
                                    <table role=\"presentation\" width=\"100%%\" cellspacing=\"0\" cellpadding=\"0\">
                                        <tr>
                                            <td align=\"center\">
                                                <table role=\"presentation\" width=\"560\" style=\"max-width:560px;width:100%%;background:#ffffff;border:1px solid #e5e7eb;border-radius:14px;padding:28px;\">
                                                    <tr>
                                                        <td style=\"font-size:22px;font-weight:700;color:#0f172a;padding-bottom:10px;\">%s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style=\"font-size:14px;line-height:1.7;color:#334155;padding-bottom:18px;\">%s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style=\"padding-bottom:18px;\">
                                                            <div style=\"display:inline-block;background:#0f172a;color:#ffffff;font-size:30px;letter-spacing:8px;font-weight:800;padding:14px 20px;border-radius:10px;\">%s</div>
                                                        </td>
                                                    </tr>
                                                    <tr>
                                                        <td style=\"font-size:13px;color:#475569;line-height:1.7;padding-bottom:8px;\">This code expires in <strong>10 minutes</strong>.</td>
                                                    </tr>
                                                    <tr>
                                                        <td style=\"font-size:13px;color:#475569;line-height:1.7;padding-bottom:22px;\">Requested for: %s</td>
                                                    </tr>
                                                    <tr>
                                                        <td style=\"border-top:1px solid #e2e8f0;padding-top:14px;font-size:12px;color:#64748b;line-height:1.6;\">If you did not request this, you can safely ignore this message. Do not share this OTP with anyone.<br/>%s Security Team</td>
                                                    </tr>
                                                </table>
                                            </td>
                                        </tr>
                                    </table>
                                </body>
                                </html>
                                """.formatted(subject, title, intro, otpCode, email, appName);

                return new EmailTemplate(subject, textBody, htmlBody);
        }

        private record EmailTemplate(String subject, String textBody, String htmlBody) {
        }
}