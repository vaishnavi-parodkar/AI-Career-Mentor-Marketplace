package com.aicareer.career_mentor_backend.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.aicareer.career_mentor_backend.entity.Assessment;
import com.aicareer.career_mentor_backend.repository.AssessmentRepository;

@Service
public class AssessmentService {

    private final AssessmentRepository assessmentRepository;

    public AssessmentService(AssessmentRepository assessmentRepository) {
        this.assessmentRepository = assessmentRepository;
    }

    public Assessment saveAssessment(Assessment assessment) {
        if (assessment.getCompletedAt() == null) {
            assessment.setCompletedAt(LocalDateTime.now());
        }

        return assessmentRepository.save(assessment);
    }

    public List<Assessment> getUserAssessments(Long userId) {
        return assessmentRepository.findByUserIdOrderByCompletedAtDesc(userId);
    }

    public Optional<Assessment> getLatestAssessment(Long userId) {
        return assessmentRepository.findFirstByUserIdOrderByCompletedAtDesc(userId);
    }

    public Assessment updateTopTrait(Long assessmentId, String topTrait) {
        Optional<Assessment> assessmentOptional =
                assessmentRepository.findById(assessmentId);

        if (assessmentOptional.isEmpty()) {
            return null;
        }

        Assessment assessment = assessmentOptional.get();
        assessment.setTopTrait(topTrait);

        return assessmentRepository.save(assessment);
    }
}