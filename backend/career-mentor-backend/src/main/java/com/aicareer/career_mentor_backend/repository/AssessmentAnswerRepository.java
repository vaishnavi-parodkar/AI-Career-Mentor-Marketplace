package com.aicareer.career_mentor_backend.repository;

import com.aicareer.career_mentor_backend.entity.AssessmentAnswer;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AssessmentAnswerRepository extends JpaRepository<AssessmentAnswer, Long> {

    List<AssessmentAnswer> findByAssessmentId(Long assessmentId);
}