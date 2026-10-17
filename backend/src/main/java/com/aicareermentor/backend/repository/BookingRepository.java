package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUserIdOrderByStartAtDesc(Long userId);
    List<Booking> findByMentorIdAndStartAtBetweenAndStatusNot(Long mentorId, Instant from, Instant to, String status);
    long countByUserId(Long userId);
    long countByUserIdAndStatus(Long userId, String status);
}
