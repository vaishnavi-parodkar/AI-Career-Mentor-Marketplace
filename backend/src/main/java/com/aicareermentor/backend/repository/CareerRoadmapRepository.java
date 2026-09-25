package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.CareerRoadmap;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CareerRoadmapRepository extends JpaRepository<CareerRoadmap, Long> {

    List<CareerRoadmap> findByUserId(Long userId);

    List<CareerRoadmap> findByUserIdAndCareerId(Long userId, Long careerId);
}