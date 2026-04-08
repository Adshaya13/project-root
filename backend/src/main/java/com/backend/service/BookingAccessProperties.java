package com.backend.service;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.booking")
public class BookingAccessProperties {

    private List<String> reviewerAuthorities = new ArrayList<>(List.of("ROLE_ADMIN"));

    public List<String> getReviewerAuthorities() {
        return reviewerAuthorities;
    }

    public void setReviewerAuthorities(List<String> reviewerAuthorities) {
        this.reviewerAuthorities = reviewerAuthorities;
    }
}