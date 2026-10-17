package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.InterviewSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface InterviewSessionRepository extends JpaRepository<InterviewSession, Long> {
    List<InterviewSession> findTop30ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
