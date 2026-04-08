package com.backend.service;

import com.backend.dto.booking.BookingCreateRequest;
import com.backend.dto.booking.BookingResponse;
import com.backend.exception.ApiException;
import com.backend.model.Booking;
import com.backend.model.BookingStatus;
import com.backend.model.Resource;
import com.backend.model.ResourceCategory;
import com.backend.model.Role;
import com.backend.model.User;
import com.backend.repository.BookingRepository;
import com.backend.repository.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Service
@Transactional
public class BookingService {

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = List.of(BookingStatus.PENDING, BookingStatus.APPROVED);

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceService resourceService;

    public BookingService(BookingRepository bookingRepository, UserRepository userRepository, ResourceService resourceService) {
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.resourceService = resourceService;
    }

    public BookingResponse createBooking(String requesterEmail, BookingCreateRequest request) {
        User requester = findUserOrThrow(requesterEmail);
        Resource resource = resourceService.findResourceOrThrow(request.resourceId());

        validateTimeRange(request.bookingDate(), request.startTime(), request.endTime());
        validateBookingAuthority(requester, resource);
        validateConflict(requester, resource.getId(), request.bookingDate(), request.startTime(), request.endTime());

        Booking booking = new Booking();
        booking.setRequester(requester);
        booking.setResource(resource);
        booking.setBookingDate(request.bookingDate());
        booking.setStartTime(request.startTime());
        booking.setEndTime(request.endTime());
        booking.setPurpose(request.purpose().trim());
        booking.setAttendees(request.attendees());
        booking.setStatus(BookingStatus.PENDING);

        return BookingResponse.from(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings(String requesterEmail) {
        return bookingRepository.findByRequesterEmailOrderByBookingDateDescStartTimeDesc(requesterEmail).stream()
                .map(BookingResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getAllBookings(BookingStatus status, Long resourceId, LocalDate bookingDate) {
        return bookingRepository.findAllByOrderByBookingDateDescStartTimeDesc().stream()
                .filter(booking -> status == null || booking.getStatus() == status)
                .filter(booking -> resourceId == null || booking.getResource().getId().equals(resourceId))
                .filter(booking -> bookingDate == null || booking.getBookingDate().equals(bookingDate))
                .map(BookingResponse::from)
                .toList();
    }

    public BookingResponse approveBooking(Long bookingId, String reviewerEmail, String note) {
        Booking booking = findBookingOrThrow(bookingId);
        ensurePending(booking);

        User reviewer = findUserOrThrow(reviewerEmail);
        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedBy(reviewer);
        booking.setReviewedAt(Instant.now());
        booking.setReviewNote(normalizeNote(note));

        return BookingResponse.from(bookingRepository.save(booking));
    }

    public BookingResponse rejectBooking(Long bookingId, String reviewerEmail, String note) {
        Booking booking = findBookingOrThrow(bookingId);
        ensurePending(booking);

        User reviewer = findUserOrThrow(reviewerEmail);
        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedBy(reviewer);
        booking.setReviewedAt(Instant.now());
        booking.setReviewNote(normalizeNote(note));

        return BookingResponse.from(bookingRepository.save(booking));
    }

    public BookingResponse cancelBooking(Long bookingId, String requesterEmail) {
        Booking booking = findBookingOrThrow(bookingId);

        if (booking.getRequester() == null || !requesterEmail.equalsIgnoreCase(booking.getRequester().getEmail())) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Only the booking owner can cancel this booking");
        }

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new ApiException(HttpStatus.CONFLICT, "Rejected bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        booking.setCancelledAt(Instant.now());
        return BookingResponse.from(bookingRepository.save(booking));
    }

    private void validateBookingAuthority(User requester, Resource resource) {
        Role role = requester.getRole();
        if (role == Role.STAFF) {
            return;
        }

        if (role == Role.STUDENT && resource.getCategory() == ResourceCategory.EQUIPMENT) {
            return;
        }

        if (role == Role.STUDENT) {
            throw new ApiException(HttpStatus.FORBIDDEN, "Students can only book equipment resources");
        }

        throw new ApiException(HttpStatus.FORBIDDEN, "This account is not allowed to create bookings");
    }

    private void validateConflict(User requester, Long resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        boolean conflict;

        if (requester.getRole() == Role.STAFF) {
            conflict = bookingRepository.existsOverlappingBookingForRoles(
                    resourceId,
                    bookingDate,
                    List.of(BookingStatus.APPROVED, BookingStatus.PENDING),
                    List.of(Role.STAFF),
                    startTime,
                    endTime
            ) || bookingRepository.existsOverlappingBooking(
                    resourceId,
                    bookingDate,
                    List.of(BookingStatus.APPROVED),
                    startTime,
                    endTime
            );
        } else {
            conflict = bookingRepository.existsOverlappingBooking(
                    resourceId,
                    bookingDate,
                    ACTIVE_BOOKING_STATUSES,
                    startTime,
                    endTime
            );
        }

        if (conflict) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking overlaps with an existing active booking");
        }
    }

    private void validateTimeRange(LocalDate bookingDate, LocalTime startTime, LocalTime endTime) {
        if (bookingDate == null || startTime == null || endTime == null) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking date, start time, and end time are required");
        }

        if (bookingDate.isBefore(LocalDate.now())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Booking date cannot be in the past");
        }

        if (!startTime.isBefore(endTime)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Start time must be before end time");
        }
    }

    private void ensurePending(Booking booking) {
        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new ApiException(HttpStatus.CONFLICT, "Only pending bookings can be approved or rejected");
        }
    }

    private User findUserOrThrow(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private Booking findBookingOrThrow(Long bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
    }

    private String normalizeNote(String note) {
        if (note == null) {
            return null;
        }

        String trimmed = note.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}