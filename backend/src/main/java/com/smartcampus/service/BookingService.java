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
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.ConcurrentMap;
import java.util.concurrent.locks.ReentrantLock;
import java.util.function.Supplier;

@Slf4j
@Service
@RequiredArgsConstructor
public class BookingService {

    private static final int DEFAULT_AVAILABILITY_START_MINUTES = (7 * 60) + 30;
    private static final int DEFAULT_AVAILABILITY_END_MINUTES = (20 * 60) + 30;
    private static final int MAX_BOOKING_DURATION_MINUTES = 180;
    private static final Pattern TIME_TOKEN_PATTERN = Pattern.compile("(?i)(\\d{1,2})(?::(\\d{2}))?\\s*(AM|PM)?");

    private static final ConcurrentMap<String, ReentrantLock> RESOURCE_LOCKS = new ConcurrentHashMap<>();

    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public BookingDTO.Response createBooking(String userEmail, BookingDTO.CreateRequest request) {
        return withResourceLock(request.getResourceId(), () -> {
            User user = findUserByEmail(userEmail);
            Resource resource = findResourceById(request.getResourceId());
            AvailabilityWindow availabilityWindow = resolveAvailabilityWindow(resource.getAvailabilityWindows());

            validateTimeRange(request);
            validateAvailabilityWindow(request, availabilityWindow);
            validateAttendees(request, resource);
            validateOneBookingPerDayRule(user, resource, request.getDate());

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
                    .date(request.getDate())
                    .startTime(request.getStartTime())
                    .endTime(request.getEndTime())
                    .purpose(request.getPurpose().trim())
                    .attendees(request.getAttendees())
                    .status(Booking.BookingStatus.PENDING)
                    .build();

            Booking saved = bookingRepository.save(booking);
            log.info("Booking request created: bookingId={}", saved.getId());
            return BookingDTO.Response.from(saved);
        });
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
        return withResourceLock(target.getResourceId(), () -> {
            Booking latestTarget = findBookingById(bookingId);
            ensurePending(latestTarget);

            List<Booking> overlaps = findOverlappingBookings(
                    latestTarget.getResourceId(),
                    latestTarget.getDate(),
                    latestTarget.getStartTime(),
                    latestTarget.getEndTime(),
                    List.of(Booking.BookingStatus.APPROVED, Booking.BookingStatus.PENDING)).stream()
                    .filter(existing -> !Objects.equals(existing.getId(), latestTarget.getId()))
                    .toList();

            boolean approvedAnyConflict = overlaps.stream().anyMatch(existing ->
                existing.getStatus() == Booking.BookingStatus.APPROVED);
            if (approvedAnyConflict) {
                throw new BadRequestException("Resource already booked for selected time");
            }

            rejectOverlappingBookings(
                overlaps,
                List.of(Booking.BookingStatus.PENDING),
                "Slot already allocated to another approved booking",
                adminEmail);

            latestTarget.setStatus(Booking.BookingStatus.APPROVED);
            latestTarget.setRejectionReason(null);
            latestTarget.setApprovedBy(adminEmail);
            latestTarget.setApprovedAt(LocalDateTime.now());
            latestTarget.setRejectedBy(null);
            latestTarget.setRejectedAt(null);
            Booking updated = bookingRepository.save(latestTarget);

            // Set resource out of service upon booking approval
            Resource resource = findResourceById(updated.getResourceId());
            resource.setStatus(Resource.ResourceStatus.OUT_OF_SERVICE);
            resourceRepository.save(resource);

            return BookingDTO.Response.from(updated);
        });
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

        // Reset resource to active upon rejection
        Resource resource = findResourceById(updated.getResourceId());
        resource.setStatus(Resource.ResourceStatus.ACTIVE);
        resourceRepository.save(resource);

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

        // Reset resource to active upon cancellation
        Resource resource = findResourceById(updated.getResourceId());
        resource.setStatus(Resource.ResourceStatus.ACTIVE);
        resourceRepository.save(resource);

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
            List<Booking.BookingStatus> statuses,
            String reason,
            String adminEmail) {
        List<Booking> toReject = overlaps.stream()
                .filter(existing -> statuses.contains(existing.getStatus()))
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

    private void validateAvailabilityWindow(BookingDTO.CreateRequest request, AvailabilityWindow availabilityWindow) {
        int startMinutes = toMinutes(request.getStartTime());
        int endMinutes = toMinutes(request.getEndTime());

        if (startMinutes < availabilityWindow.startMinutes || endMinutes > availabilityWindow.endMinutes) {
            throw new BadRequestException("Booking must be within the resource availability window");
        }

        if ((endMinutes - startMinutes) > MAX_BOOKING_DURATION_MINUTES) {
            throw new BadRequestException("Booking duration cannot exceed 3 hours");
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

    private AvailabilityWindow resolveAvailabilityWindow(String availabilityWindows) {
        List<Integer> timePoints = new ArrayList<>();
        Matcher matcher = TIME_TOKEN_PATTERN.matcher(availabilityWindows == null ? "" : availabilityWindows);

        while (matcher.find()) {
            Integer minutes = parseTimeToken(matcher.group(1), matcher.group(2), matcher.group(3));
            if (minutes != null) {
                timePoints.add(minutes);
            }
        }

        if (timePoints.size() >= 2) {
            int start = timePoints.get(0);
            int end = timePoints.get(1);
            if (end > start) {
                return new AvailabilityWindow(start, end);
            }
        }

        return new AvailabilityWindow(DEFAULT_AVAILABILITY_START_MINUTES, DEFAULT_AVAILABILITY_END_MINUTES);
    }

    private Integer parseTimeToken(String hourPart, String minutePart, String amPmPart) {
        int hours = Integer.parseInt(hourPart);
        int minutes = minutePart == null ? 0 : Integer.parseInt(minutePart);

        if (minutes < 0 || minutes >= 60) {
            return null;
        }

        String period = amPmPart == null ? "" : amPmPart.toUpperCase();
        if (period.isEmpty()) {
            if (hours < 0 || hours >= 24) {
                return null;
            }
            return (hours * 60) + minutes;
        }

        if (hours < 1 || hours > 12) {
            return null;
        }

        int normalizedHours = hours % 12;
        if ("PM".equals(period)) {
            normalizedHours += 12;
        }

        return (normalizedHours * 60) + minutes;
    }

    private int toMinutes(java.time.LocalTime time) {
        return (time.getHour() * 60) + time.getMinute();
    }

    private <T> T withResourceLock(String resourceId, Supplier<T> action) {
        ReentrantLock lock = RESOURCE_LOCKS.computeIfAbsent(resourceId, id -> new ReentrantLock());
        lock.lock();
        try {
            return action.get();
        } finally {
            lock.unlock();
        }
    }

    private record AvailabilityWindow(int startMinutes, int endMinutes) { }
}