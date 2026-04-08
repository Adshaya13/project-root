package com.backend.service;

import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

@Component("bookingAccessService")
public class BookingAccessService {

    private final BookingAccessProperties properties;

    public BookingAccessService(BookingAccessProperties properties) {
        this.properties = properties;
    }

    public boolean canReview(Authentication authentication) {
        return authentication != null
                && authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .anyMatch(properties.getReviewerAuthorities()::contains);
    }
}