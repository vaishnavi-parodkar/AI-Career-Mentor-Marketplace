package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.SimulationResult;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface SimulationResultRepository extends JpaRepository<SimulationResult, Long> {
    List<SimulationResult> findByUserIdOrderByCreatedAtDesc(Long userId);
    long countByUserId(Long userId);
}
