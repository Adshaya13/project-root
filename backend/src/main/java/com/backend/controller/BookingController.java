package com.backend.controller;

import com.backend.dto.booking.BookingCreateRequest;
import com.backend.dto.booking.BookingDecisionRequest;
import com.backend.dto.booking.BookingResponse;
import com.backend.dto.booking.ResourceResponse;
import com.backend.model.Role;
import com.backend.model.BookingStatus;
import com.backend.service.BookingService;
import com.backend.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@RestController
@RequestMapping("/api")
public class BookingController {

    private final BookingService bookingService;
    private final ResourceService resourceService;

    public BookingController(BookingService bookingService, ResourceService resourceService) {
        this.bookingService = bookingService;
        this.resourceService = resourceService;
    }

    @PostMapping("/bookings")
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingCreateRequest request,
            Authentication authentication
    ) {
        BookingResponse response = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.created(URI.create("/api/bookings/" + response.id())).body(response);
    }

    @GetMapping("/bookings/my")
    public List<BookingResponse> getMyBookings(Authentication authentication) {
        return bookingService.getMyBookings(authentication.getName());
    }

    @GetMapping("/bookings")
    @PreAuthorize("@bookingAccessService.canReview(authentication)")
    public List<BookingResponse> getAllBookings(
            @RequestParam(required = false) BookingStatus status,
            @RequestParam(required = false) Long resourceId,
            @RequestParam(required = false) LocalDate date
    ) {
        return bookingService.getAllBookings(status, resourceId, date);
    }

    @PutMapping("/bookings/{id}/approve")
    @PreAuthorize("@bookingAccessService.canReview(authentication)")
    public BookingResponse approveBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingDecisionRequest request,
            Authentication authentication
    ) {
        return bookingService.approveBooking(id, authentication.getName(), request == null ? null : request.note());
    }

    @PutMapping("/bookings/{id}/reject")
    @PreAuthorize("@bookingAccessService.canReview(authentication)")
    public BookingResponse rejectBooking(
            @PathVariable Long id,
            @RequestBody(required = false) BookingDecisionRequest request,
            Authentication authentication
    ) {
        return bookingService.rejectBooking(id, authentication.getName(), request == null ? null : request.note());
    }

    @PutMapping("/bookings/{id}/cancel")
    public BookingResponse cancelBooking(@PathVariable Long id, Authentication authentication) {
        return bookingService.cancelBooking(id, authentication.getName());
    }

    @GetMapping("/resources")
    public List<ResourceResponse> getResources(
            @RequestParam(required = false) LocalDate date,
            @RequestParam(required = false) LocalTime startTime,
            @RequestParam(required = false) LocalTime endTime,
            Authentication authentication
    ) {
        return resourceService.listAvailableResources(date, startTime, endTime, getRequesterRole(authentication));
    }

    @GetMapping("/resources/{id}")
    public ResourceResponse getResource(@PathVariable Long id) {
        return resourceService.getResource(id);
    }

    private Role getRequesterRole(Authentication authentication) {
        if (authentication == null) {
            return Role.STUDENT;
        }

        return authentication.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .map(authority -> authority.startsWith("ROLE_") ? authority.substring(5) : authority)
                .map(Role::valueOf)
                .findFirst()
                .orElse(Role.STUDENT);
    }
}