package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.SkillProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface SkillProgressRepository extends JpaRepository<SkillProgress, Long> {
    List<SkillProgress> findByUserId(Long userId);
    Optional<SkillProgress> findByUserIdAndSkillName(Long userId, String skillName);
}
