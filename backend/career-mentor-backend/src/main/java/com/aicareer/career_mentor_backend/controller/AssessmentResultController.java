package com.aicareer.career_mentor_backend.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aicareer.career_mentor_backend.entity.AssessmentAnswer;
import com.aicareer.career_mentor_backend.service.AssessmentAnswerService;
import com.aicareer.career_mentor_backend.service.AssessmentResultService;
import com.aicareer.career_mentor_backend.service.AssessmentService;

@RestController
@RequestMapping("/api/assessment-results")
@CrossOrigin(origins = "http://localhost:5173")
public class AssessmentResultController {

    private final AssessmentAnswerService assessmentAnswerService;
    private final AssessmentResultService assessmentResultService;
    private final AssessmentService assessmentService;

    public AssessmentResultController(
            AssessmentAnswerService assessmentAnswerService,
            AssessmentResultService assessmentResultService,
            AssessmentService assessmentService) {

        this.assessmentAnswerService = assessmentAnswerService;
        this.assessmentResultService = assessmentResultService;
        this.assessmentService = assessmentService;
    }

    @GetMapping("/{assessmentId}")
    public ResponseEntity<Map<String, Object>> getAssessmentResult(
            @PathVariable Long assessmentId) {

        List<AssessmentAnswer> answers =
                assessmentAnswerService.getAnswersByAssessmentId(assessmentId);

        Map<String, Integer> traitScores =
                assessmentResultService.calculateTraitScores(answers);

        String topTrait =
                assessmentResultService.findTopTrait(traitScores);

        assessmentService.updateTopTrait(assessmentId, topTrait);

        Map<String, Object> result = new HashMap<>();
        result.put("assessmentId", assessmentId);
        result.put("traitScores", traitScores);
        result.put("topTrait", topTrait);

        return ResponseEntity.ok(result);
    }
}