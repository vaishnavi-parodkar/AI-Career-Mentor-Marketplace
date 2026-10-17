package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.FollowUpTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface FollowUpTaskRepository extends JpaRepository<FollowUpTask, Long> {
    List<FollowUpTask> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<FollowUpTask> findByBookingId(Long bookingId);
}
