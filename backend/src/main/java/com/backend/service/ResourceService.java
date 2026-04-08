package com.backend.service;

import com.backend.dto.booking.ResourceResponse;
import com.backend.exception.ApiException;
import com.backend.model.BookingStatus;
import com.backend.model.Resource;
import com.backend.model.Role;
import com.backend.repository.BookingRepository;
import com.backend.repository.ResourceRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

import static com.backend.model.BookingStatus.APPROVED;
import static com.backend.model.BookingStatus.PENDING;

@Service
public class ResourceService {

    private static final List<BookingStatus> ACTIVE_BOOKING_STATUSES = List.of(PENDING, APPROVED);

    private final ResourceRepository resourceRepository;
    private final BookingRepository bookingRepository;

    public ResourceService(ResourceRepository resourceRepository, BookingRepository bookingRepository) {
        this.resourceRepository = resourceRepository;
        this.bookingRepository = bookingRepository;
    }

    public List<ResourceResponse> listAvailableResources() {
        return resourceRepository.findByActiveTrueAndBookableTrueOrderByNameAsc().stream()
                .map(ResourceResponse::from)
                .toList();
    }

    public List<ResourceResponse> listAvailableResources(LocalDate bookingDate, LocalTime startTime, LocalTime endTime, Role requesterRole) {
        if (bookingDate == null || startTime == null || endTime == null) {
            return listAvailableResources();
        }

        return resourceRepository.findByActiveTrueAndBookableTrueOrderByNameAsc().stream()
                .filter(resource -> isAvailable(resource.getId(), bookingDate, startTime, endTime, requesterRole))
                .map(ResourceResponse::from)
                .toList();
    }

    public ResourceResponse getResource(Long id) {
        return ResourceResponse.from(findResourceOrThrow(id));
    }

    public Resource findResourceOrThrow(Long id) {
        return resourceRepository.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Resource not found"));
    }

    private boolean isAvailable(Long resourceId, LocalDate bookingDate, LocalTime startTime, LocalTime endTime, Role requesterRole) {
        if (requesterRole == Role.STAFF) {
            boolean hasApprovedConflict = bookingRepository.existsOverlappingBooking(
                    resourceId,
                    bookingDate,
                    List.of(APPROVED),
                    startTime,
                    endTime
            );

            boolean hasPendingStaffConflict = bookingRepository.existsOverlappingBookingForRoles(
                    resourceId,
                    bookingDate,
                    List.of(PENDING),
                    List.of(Role.STAFF),
                    startTime,
                    endTime
            );

            return !hasApprovedConflict && !hasPendingStaffConflict;
        }

        return !bookingRepository.existsOverlappingBooking(
                resourceId,
                bookingDate,
                ACTIVE_BOOKING_STATUSES,
                startTime,
                endTime
        );
    }
}