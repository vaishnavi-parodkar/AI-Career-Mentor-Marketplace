package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.AiUsageLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.List;

public interface AiUsageLogRepository extends JpaRepository<AiUsageLog, Long> {

    List<AiUsageLog> findByCreatedAtAfter(Instant since);

    List<AiUsageLog> findTop50ByOrderByCreatedAtDesc();
}
