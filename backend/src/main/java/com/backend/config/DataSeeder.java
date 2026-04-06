package com.backend.config;

import com.backend.model.Role;
import com.backend.model.User;
import com.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner seedAdmin(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.admin-name}") String adminName,
            @Value("${app.bootstrap.admin-email}") String adminEmail,
            @Value("${app.bootstrap.admin-password}") String adminPassword
    ) {
        return args -> {
            String email = adminEmail.trim().toLowerCase();
            if (userRepository.existsByEmail(email)) {
                return;
            }

            User admin = new User();
            admin.setFullName(adminName);
            admin.setEmail(email);
            admin.setPhone("+0000000000");
            admin.setGender("unspecified");
            admin.setRole(Role.ADMIN);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setEmailVerified(true);
            admin.setGoogleAccount(false);
            userRepository.save(admin);
        };
    }
}