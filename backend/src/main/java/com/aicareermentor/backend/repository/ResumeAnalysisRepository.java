package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.ResumeAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface ResumeAnalysisRepository extends JpaRepository<ResumeAnalysis, Long> {
    List<ResumeAnalysis> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
