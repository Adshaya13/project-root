package com.backend.dto.booking;

import com.backend.model.Booking;
import com.backend.model.BookingStatus;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;

public record BookingResponse(
        Long id,
        ResourceResponse resource,
        BookingUserResponse requester,
        BookingUserResponse reviewedBy,
        LocalDate bookingDate,
        LocalTime startTime,
        LocalTime endTime,
        String purpose,
        Integer attendees,
        BookingStatus status,
        String reviewNote,
        Instant reviewedAt,
        Instant cancelledAt,
        Instant createdAt,
        Instant updatedAt
) {
    public static BookingResponse from(Booking booking) {
        return new BookingResponse(
                booking.getId(),
                ResourceResponse.from(booking.getResource()),
                BookingUserResponse.from(booking.getRequester()),
                BookingUserResponse.from(booking.getReviewedBy()),
                booking.getBookingDate(),
                booking.getStartTime(),
                booking.getEndTime(),
                booking.getPurpose(),
                booking.getAttendees(),
                booking.getStatus(),
                booking.getReviewNote(),
                booking.getReviewedAt(),
                booking.getCancelledAt(),
                booking.getCreatedAt(),
                booking.getUpdatedAt()
        );
    }
}