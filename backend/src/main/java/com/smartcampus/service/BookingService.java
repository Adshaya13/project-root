package com.smartcampus.service;

import com.smartcampus.dto.BookingDTO;
import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Booking;
import com.smartcampus.model.Resource;
import com.smartcampus.model.User;
import com.smartcampus.repository.BookingRepository;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.EnumSet;
import java.util.List;
import java.util.Objects;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public BookingDTO.Response createBooking(String userEmail, BookingDTO.CreateRequest request) {
        User user = findUserByEmail(userEmail);
        Resource resource = findResourceById(request.getResourceId());

        validateTimeRange(request);
        validateAttendees(request, resource);
        validateOneBookingPerDayRule(user, resource, request.getDate());

        Booking.UserRole userRole = mapToBookingUserRole(user);
        validateBookingAccess(user, userRole);
        validateResourceAccess(userRole, resource);

        List<Booking> approvedOverlaps = findOverlappingBookings(
                request.getResourceId(),
                request.getDate(),
                request.getStartTime(),
                request.getEndTime(),
                List.of(Booking.BookingStatus.APPROVED, Booking.BookingStatus.PENDING));

        if (!approvedOverlaps.isEmpty()) {
            throw new BadRequestException("Resource already booked for selected time");
        }

        Booking booking = Booking.builder()
                .resourceId(resource.getId())
                .resourceName(resource.getName())
                .userId(user.getId())
                .userName(user.getName() == null || user.getName().isBlank() ? user.getEmail() : user.getName())
                .userRole(userRole)
                .date(request.getDate())
                .startTime(request.getStartTime())
                .endTime(request.getEndTime())
                .purpose(request.getPurpose().trim())
                .attendees(request.getAttendees())
                .status(Booking.BookingStatus.PENDING)
                .build();

        Booking saved = bookingRepository.save(booking);
        log.info("Booking request created: bookingId={}, userRole={}", saved.getId(), saved.getUserRole());
        return BookingDTO.Response.from(saved);
    }

    public List<BookingDTO.Response> getMyBookings(String userEmail) {
        User user = findUserByEmail(userEmail);
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(BookingDTO.Response::from)
                .toList();
    }

    public List<BookingDTO.Response> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(BookingDTO.Response::from)
                .toList();
    }

    public BookingDTO.Response approveBooking(String bookingId, String adminEmail) {
        Booking target = findBookingById(bookingId);
        ensurePending(target);

        List<Booking> overlaps = findOverlappingBookings(
                target.getResourceId(),
                target.getDate(),
                target.getStartTime(),
                target.getEndTime(),
                List.of(Booking.BookingStatus.APPROVED, Booking.BookingStatus.PENDING)).stream()
                .filter(existing -> !Objects.equals(existing.getId(), target.getId()))
                .toList();

        if (target.getUserRole() == Booking.UserRole.STAFF) {
            boolean approvedStaffConflict = overlaps.stream().anyMatch(existing ->
                    existing.getStatus() == Booking.BookingStatus.APPROVED
                            && existing.getUserRole() == Booking.UserRole.STAFF);

            if (approvedStaffConflict) {
                throw new BadRequestException("Resource already has an approved staff booking for this slot");
            }

            rejectOverlappingBookings(
                    overlaps,
                    EnumSet.of(Booking.BookingStatus.APPROVED, Booking.BookingStatus.PENDING),
                    Booking.UserRole.STUDENT,
                    "Higher priority booking (staff)",
                    adminEmail);

            rejectOverlappingBookings(
                    overlaps,
                    EnumSet.of(Booking.BookingStatus.PENDING),
                    null,
                    "Slot already allocated to another approved booking",
                    adminEmail);
        } else {
            boolean approvedStaffConflict = overlaps.stream().anyMatch(existing ->
                    existing.getStatus() == Booking.BookingStatus.APPROVED
                            && existing.getUserRole() == Booking.UserRole.STAFF);
            if (approvedStaffConflict) {
                throw new BadRequestException("Slot reserved for higher priority user");
            }

            boolean approvedAnyConflict = overlaps.stream().anyMatch(existing ->
                    existing.getStatus() == Booking.BookingStatus.APPROVED);
            if (approvedAnyConflict) {
                throw new BadRequestException("Resource already booked for selected time");
            }

            boolean pendingStaffExists = overlaps.stream().anyMatch(existing ->
                    existing.getStatus() == Booking.BookingStatus.PENDING
                            && existing.getUserRole() == Booking.UserRole.STAFF);
            if (pendingStaffExists) {
                throw new BadRequestException("Pending higher priority booking exists for this slot");
            }

            rejectOverlappingBookings(
                    overlaps,
                    EnumSet.of(Booking.BookingStatus.PENDING),
                    Booking.UserRole.STUDENT,
                    "Slot already allocated to another approved booking",
                    adminEmail);
        }

        target.setStatus(Booking.BookingStatus.APPROVED);
        target.setRejectionReason(null);
        target.setApprovedBy(adminEmail);
        target.setApprovedAt(LocalDateTime.now());
        target.setRejectedBy(null);
        target.setRejectedAt(null);
        Booking updated = bookingRepository.save(target);
        return BookingDTO.Response.from(updated);
    }

    public BookingDTO.Response rejectBooking(String bookingId, String reason, String adminEmail) {
        Booking booking = findBookingById(bookingId);
        ensurePending(booking);

        if (reason == null || reason.trim().isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }

        booking.setStatus(Booking.BookingStatus.REJECTED);
        booking.setRejectionReason(reason.trim());
        booking.setRejectedBy(adminEmail);
        booking.setRejectedAt(LocalDateTime.now());
        booking.setApprovedBy(null);
        booking.setApprovedAt(null);
        Booking updated = bookingRepository.save(booking);
        return BookingDTO.Response.from(updated);
    }

    public BookingDTO.Response cancelBooking(String bookingId, String userEmail) {
        Booking booking = findBookingById(bookingId);
        User user = findUserByEmail(userEmail);

        if (!Objects.equals(booking.getUserId(), user.getId())) {
            throw new BadRequestException("You can only cancel your own booking");
        }

        if (booking.getStatus() != Booking.BookingStatus.APPROVED
                && booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only pending or approved bookings can be cancelled");
        }

        booking.setStatus(Booking.BookingStatus.CANCELLED);
        booking.setApprovedBy(null);
        booking.setApprovedAt(null);
        Booking updated = bookingRepository.save(booking);
        return BookingDTO.Response.from(updated);
    }

    private List<Booking> findOverlappingBookings(
            String resourceId,
            java.time.LocalDate date,
            java.time.LocalTime startTime,
            java.time.LocalTime endTime,
            List<Booking.BookingStatus> statuses) {
        return bookingRepository.findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
                resourceId,
                date,
                statuses,
                endTime,
                startTime);
    }

    private void rejectOverlappingBookings(
            List<Booking> overlaps,
            EnumSet<Booking.BookingStatus> statuses,
            Booking.UserRole userRole,
            String reason,
            String adminEmail) {
        List<Booking> toReject = overlaps.stream()
                .filter(existing -> statuses.contains(existing.getStatus()))
                .filter(existing -> userRole == null || existing.getUserRole() == userRole)
                .toList();

        for (Booking booking : toReject) {
            booking.setStatus(Booking.BookingStatus.REJECTED);
            booking.setRejectionReason(reason);
            booking.setRejectedBy(adminEmail);
            booking.setRejectedAt(LocalDateTime.now());
            booking.setApprovedBy(null);
            booking.setApprovedAt(null);
        }

        if (!toReject.isEmpty()) {
            bookingRepository.saveAll(toReject);
        }
    }

    private void validateTimeRange(BookingDTO.CreateRequest request) {
        if (!request.getStartTime().isBefore(request.getEndTime())) {
            throw new BadRequestException("start_time must be earlier than end_time");
        }

        LocalDate today = LocalDate.now();
        LocalDate minDate = today.plusDays(1);
        LocalDate maxDate = today.plusDays(14);
        if (request.getDate().isBefore(minDate) || request.getDate().isAfter(maxDate)) {
            throw new BadRequestException("Booking date must be between +1 and +14 days from today");
        }

        Duration duration = Duration.between(request.getStartTime(), request.getEndTime());
        if (duration.compareTo(Duration.ofHours(3)) > 0) {
            throw new BadRequestException("Booking duration cannot exceed 3 hours");
        }
    }

    private void validateAttendees(BookingDTO.CreateRequest request, Resource resource) {
        if (request.getAttendees() > resource.getCapacity()) {
            throw new BadRequestException("Attendees count exceeds resource capacity");
        }
    }

    private void validateOneBookingPerDayRule(User user, Resource resource, LocalDate date) {
        String type = resource.getType() == null ? "" : resource.getType().name();
        boolean isSingleBookingType = "EQUIPMENT".equals(type) || "STUDY_AREA".equals(type);

        if (!isSingleBookingType) {
            return;
        }

        List<Booking> existing = bookingRepository.findByUserIdAndDateAndStatusIn(
                user.getId(),
                date,
                List.of(Booking.BookingStatus.PENDING, Booking.BookingStatus.APPROVED));

        if (!existing.isEmpty()) {
            throw new BadRequestException("Only one booking per day is allowed for this resource type");
        }
    }

    private void ensurePending(Booking booking) {
        if (booking.getStatus() != Booking.BookingStatus.PENDING) {
            throw new BadRequestException("Only PENDING bookings can be processed");
        }
    }

    private void validateBookingAccess(User user, Booking.UserRole userRole) {
        if (user.getRole() == User.Role.USER && userRole == Booking.UserRole.STUDENT && !user.isBookingAccess()) {
            throw new BadRequestException("Booking access not granted. Contact admin.");
        }
    }

    private void validateResourceAccess(Booking.UserRole userRole, Resource resource) {
        if (userRole != Booking.UserRole.STUDENT) {
            return;
        }

        if (resource.getType() != Resource.ResourceType.EQUIPMENT) {
            throw new BadRequestException("You are not allowed to book this resource");
        }
    }

    private Booking.UserRole mapToBookingUserRole(User user) {
        if (user.getRole() == null) {
            return Booking.UserRole.STUDENT;
        }

        return switch (user.getRole()) {
            case USER -> user.getUserRole() == User.BookingUserRole.STAFF
                    ? Booking.UserRole.STAFF
                    : Booking.UserRole.STUDENT;
            case ADMIN -> Booking.UserRole.STAFF;
            case TECHNICIAN -> Booking.UserRole.STUDENT;
        };
    }

    private User findUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private Resource findResourceById(String resourceId) {
        return resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + resourceId));
    }

    private Booking findBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found with id: " + bookingId));
    }
}