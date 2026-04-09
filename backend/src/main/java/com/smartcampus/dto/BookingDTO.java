package com.smartcampus.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.smartcampus.model.Booking;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class BookingDTO {

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CreateRequest {

        @NotBlank(message = "resource_id is required")
        @JsonProperty("resource_id")
        private String resourceId;

        @NotNull(message = "date is required")
        private LocalDate date;

        @NotNull(message = "start_time is required")
        @JsonProperty("start_time")
        private LocalTime startTime;

        @NotNull(message = "end_time is required")
        @JsonProperty("end_time")
        private LocalTime endTime;

        @NotBlank(message = "purpose is required")
        private String purpose;

        @NotNull(message = "attendees is required")
        @Min(value = 1, message = "attendees must be at least 1")
        @Max(value = 10000, message = "attendees value is too large")
        private Integer attendees;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RejectRequest {
        @NotBlank(message = "Rejection reason is required")
        private String reason;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Response {

        @JsonProperty("booking_id")
        private String bookingId;

        @JsonProperty("resource_id")
        private String resourceId;

        @JsonProperty("resource_name")
        private String resourceName;

        @JsonProperty("user_id")
        private String userId;

        @JsonProperty("user_name")
        private String userName;

        @JsonProperty("user_role")
        private Booking.UserRole userRole;

        private LocalDate date;

        @JsonProperty("start_time")
        private LocalTime startTime;

        @JsonProperty("end_time")
        private LocalTime endTime;

        private String purpose;
        private Integer attendees;

        private Booking.BookingStatus status;

        @JsonProperty("rejection_reason")
        private String rejectionReason;

        @JsonProperty("created_at")
        private LocalDateTime createdAt;

        @JsonProperty("updated_at")
        private LocalDateTime updatedAt;

        public static Response from(Booking booking) {
            return Response.builder()
                    .bookingId(booking.getId())
                    .resourceId(booking.getResourceId())
                    .resourceName(booking.getResourceName())
                    .userId(booking.getUserId())
                    .userName(booking.getUserName())
                    .userRole(booking.getUserRole())
                    .date(booking.getDate())
                    .startTime(booking.getStartTime())
                    .endTime(booking.getEndTime())
                    .purpose(booking.getPurpose())
                    .attendees(booking.getAttendees())
                    .status(booking.getStatus())
                    .rejectionReason(booking.getRejectionReason())
                    .createdAt(booking.getCreatedAt())
                    .updatedAt(booking.getUpdatedAt())
                    .build();
        }
    }
}