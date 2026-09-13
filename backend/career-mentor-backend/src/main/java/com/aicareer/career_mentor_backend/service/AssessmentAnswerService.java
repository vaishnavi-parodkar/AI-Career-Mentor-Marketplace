package com.aicareer.career_mentor_backend.service;

import com.aicareer.career_mentor_backend.entity.AssessmentAnswer;
import com.aicareer.career_mentor_backend.repository.AssessmentAnswerRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AssessmentAnswerService {

    private final AssessmentAnswerRepository assessmentAnswerRepository;

    public AssessmentAnswerService(
            AssessmentAnswerRepository assessmentAnswerRepository) {
        this.assessmentAnswerRepository = assessmentAnswerRepository;
    }

    public AssessmentAnswer saveAnswer(AssessmentAnswer answer) {
        return assessmentAnswerRepository.save(answer);
    }

    public List<AssessmentAnswer> getAnswersByAssessmentId(Long assessmentId) {
        return assessmentAnswerRepository.findByAssessmentId(assessmentId);
    }
}