package com.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

@Service
public class MailService {

    private static final Logger log = LoggerFactory.getLogger(MailService.class);

    private final JavaMailSender javaMailSender;
    private final boolean smtpEnabled;
    private final String fromAddress;
    private final String smtpHost;

    public MailService(
            JavaMailSender javaMailSender,
            @Value("${spring.mail.host:}") String mailHost,
            @Value("${spring.mail.username:}") String mailUsername,
            @Value("${spring.mail.password:}") String mailPassword
    ) {
        this.javaMailSender = javaMailSender;
        this.smtpEnabled = StringUtils.hasText(mailHost)
                && StringUtils.hasText(mailUsername)
                && StringUtils.hasText(mailPassword);
        this.fromAddress = StringUtils.hasText(mailUsername) ? mailUsername : "no-reply@campusflow.local";
        this.smtpHost = mailHost;

        if (StringUtils.hasText(mailHost) && !this.smtpEnabled) {
            log.warn("SMTP host is configured, but username/password are missing. Outbound email is disabled.");
        }
    }

    @Async("mailTaskExecutor")
    public void sendEmail(String to, String subject, String textBody, String htmlBody) {
        if (!smtpEnabled) {
            log.info("SMTP not configured. Email to {} with subject '{}' was not sent. Body preview: {}",
                    to,
                    subject,
                    textBody);
            return;
        }

        try {
            var message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(textBody, htmlBody);
            javaMailSender.send(message);
            log.info("Email sent to {} via SMTP host {}", to, smtpHost);
        } catch (Exception exception) {
            log.error("Failed to send email to {}", to, exception);
        }
    }
}