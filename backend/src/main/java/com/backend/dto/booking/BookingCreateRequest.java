package com.backend.dto.booking;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.time.LocalDate;
import java.time.LocalTime;

public record BookingCreateRequest(
        @NotNull Long resourceId,
        @NotNull LocalDate bookingDate,
        @NotNull LocalTime startTime,
        @NotNull LocalTime endTime,
        @NotBlank String purpose,
        @NotNull @Positive Integer attendees
) {
}