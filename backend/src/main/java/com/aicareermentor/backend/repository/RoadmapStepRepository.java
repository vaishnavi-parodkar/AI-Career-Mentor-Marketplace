package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.RoadmapStep;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RoadmapStepRepository extends JpaRepository<RoadmapStep, Long> {

    List<RoadmapStep> findByRoadmapIdOrderByStepOrderAsc(Long roadmapId);
}