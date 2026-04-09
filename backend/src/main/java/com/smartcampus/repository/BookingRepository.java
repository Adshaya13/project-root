package com.smartcampus.repository;

import com.smartcampus.model.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Repository
public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findAllByOrderByCreatedAtDesc();

    List<Booking> findByUserIdOrderByCreatedAtDesc(String userId);

    List<Booking> findByResourceIdAndDateAndStatusInAndStartTimeLessThanAndEndTimeGreaterThan(
            String resourceId,
            LocalDate date,
            List<Booking.BookingStatus> statuses,
            LocalTime endTime,
            LocalTime startTime);
}