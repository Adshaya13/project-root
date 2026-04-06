package com.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender javaMailSender;
    private final boolean smtpEnabled;
    private final String fromAddress;

    public MailService(
            JavaMailSender javaMailSender,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.username:}") String mailUsername
    ) {
        this.javaMailSender = javaMailSender;
        this.smtpEnabled = StringUtils.hasText(mailHost);
        this.fromAddress = StringUtils.hasText(mailUsername) ? mailUsername : "no-reply@campusflow.local";
    }

    public void sendOtp(String to, String subject, String body) {
        if (!smtpEnabled) {
            log.info("SMTP not configured. OTP mail to {}: {}", to, body);
            return;
        }

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromAddress);
        message.setTo(to);
        message.setSubject(subject);
        message.setText(body);
        javaMailSender.send(message);
    }
}