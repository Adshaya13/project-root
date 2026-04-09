package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.BookingDTO;
import com.smartcampus.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> createBooking(
            Authentication authentication,
            @Valid @RequestBody BookingDTO.CreateRequest request) {

        BookingDTO.Response created = bookingService.createBooking(authentication.getName(), request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Booking request submitted"));
    }

    @GetMapping("/my")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingDTO.Response>>> getMyBookings(Authentication authentication) {
        List<BookingDTO.Response> bookings = bookingService.getMyBookings(authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<BookingDTO.Response>>> getAllBookings() {
        List<BookingDTO.Response> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(ApiResponse.success(bookings));
    }

    @PutMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> approveBooking(
            @PathVariable String id,
            Authentication authentication) {
        BookingDTO.Response booking = bookingService.approveBooking(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking approved"));
    }

    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> rejectBooking(
            @PathVariable String id,
            @Valid @RequestBody BookingDTO.RejectRequest request,
            Authentication authentication) {

        BookingDTO.Response booking = bookingService.rejectBooking(id, request.getReason(), authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking rejected"));
    }

    @PutMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'TECHNICIAN', 'ADMIN')")
    public ResponseEntity<ApiResponse<BookingDTO.Response>> cancelBooking(
            @PathVariable String id,
            Authentication authentication) {

        BookingDTO.Response booking = bookingService.cancelBooking(id, authentication.getName());
        return ResponseEntity.ok(ApiResponse.success(booking, "Booking cancelled"));
    }
}