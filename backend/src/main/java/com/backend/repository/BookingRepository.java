package com.backend.repository;

import com.backend.model.Booking;
import com.backend.model.BookingStatus;
import com.backend.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByRequesterEmailOrderByBookingDateDescStartTimeDesc(String email);

    List<Booking> findAllByOrderByBookingDateDescStartTimeDesc();

    Optional<Booking> findByIdAndRequesterEmail(Long id, String requesterEmail);

    @Query("""
            select case when count(b) > 0 then true else false end
            from Booking b
            where b.resource.id = :resourceId
              and b.bookingDate = :bookingDate
              and b.status in :statuses
              and b.startTime < :endTime
              and b.endTime > :startTime
            """)
    boolean existsOverlappingBooking(
            @Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );

    @Query("""
            select case when count(b) > 0 then true else false end
            from Booking b
            where b.resource.id = :resourceId
              and b.bookingDate = :bookingDate
              and b.status in :statuses
              and b.requester.role in :roles
              and b.startTime < :endTime
              and b.endTime > :startTime
            """)
    boolean existsOverlappingBookingForRoles(
            @Param("resourceId") Long resourceId,
            @Param("bookingDate") LocalDate bookingDate,
            @Param("statuses") Collection<BookingStatus> statuses,
            @Param("roles") Collection<Role> roles,
            @Param("startTime") LocalTime startTime,
            @Param("endTime") LocalTime endTime
    );
}