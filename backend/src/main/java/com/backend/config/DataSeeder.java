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

            User admin = userRepository.findByEmail(email).orElseGet(User::new);
            admin.setFullName(adminName);
            admin.setEmail(email);

            if (admin.getPhone() == null || admin.getPhone().isBlank()) {
                admin.setPhone("+0000000000");
            }
            if (admin.getGender() == null || admin.getGender().isBlank()) {
                admin.setGender("unspecified");
            }

            admin.setRole(Role.ADMIN);
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setEmailVerified(true);
            admin.setGoogleAccount(false);
            userRepository.save(admin);
        };
    }

    @Bean
    CommandLineRunner seedStudent(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.student-name}") String studentName,
            @Value("${app.bootstrap.student-email}") String studentEmail,
            @Value("${app.bootstrap.student-phone}") String studentPhone,
            @Value("${app.bootstrap.student-password}") String studentPassword
    ) {
        return args -> {
            String email = studentEmail.trim().toLowerCase();

            User student = userRepository.findByEmail(email).orElseGet(User::new);
            student.setFullName(studentName);
            student.setEmail(email);
            student.setPhone(studentPhone);
            student.setGender("unspecified");
            student.setRole(Role.STUDENT);
            student.setPasswordHash(passwordEncoder.encode(studentPassword));
            student.setEmailVerified(true);
            student.setGoogleAccount(false);
            userRepository.save(student);
        };
    }

    @Bean
    CommandLineRunner seedStaff(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            @Value("${app.bootstrap.staff-name}") String staffName,
            @Value("${app.bootstrap.staff-email}") String staffEmail,
            @Value("${app.bootstrap.staff-phone}") String staffPhone,
            @Value("${app.bootstrap.staff-password}") String staffPassword
    ) {
        return args -> {
            String email = staffEmail.trim().toLowerCase();

            User staff = userRepository.findByEmail(email).orElseGet(User::new);
            staff.setFullName(staffName);
            staff.setEmail(email);
            staff.setPhone(staffPhone);
            staff.setGender("unspecified");
            staff.setRole(Role.STAFF);
            staff.setPasswordHash(passwordEncoder.encode(staffPassword));
            staff.setEmailVerified(true);
            staff.setGoogleAccount(false);
            userRepository.save(staff);
        };
    }
}