package com.smartcampus.model;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {

    @Id
    private String id;

    @Indexed(unique = true)
    private String email;

    private String name;
    private String avatarUrl;
    private String googleId;
    private String passwordHash;

    @Builder.Default
    private AuthProvider authProvider = AuthProvider.LOCAL;

    private Role role;

    @Builder.Default
    private BookingUserRole userRole = BookingUserRole.STUDENT;

    @Builder.Default
    private boolean bookingAccess = false;

    @Builder.Default
    private boolean active = true;

    @CreatedDate
    private LocalDateTime createdAt;

    public enum Role {
        USER, ADMIN, TECHNICIAN
    }

    public enum AuthProvider {
        LOCAL, GOOGLE
    }

    public enum BookingUserRole {
        STUDENT, STAFF
    }
}
