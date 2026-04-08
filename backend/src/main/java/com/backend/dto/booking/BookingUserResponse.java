package com.backend.dto.booking;

import com.backend.model.User;

public record BookingUserResponse(
        Long id,
        String fullName,
        String email,
        String role
) {
    public static BookingUserResponse from(User user) {
        if (user == null) {
            return null;
        }

        return new BookingUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole() == null ? null : user.getRole().name()
        );
    }
}