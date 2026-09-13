package com.aicareer.career_mentor_backend.controller;

import com.aicareer.career_mentor_backend.dto.AssessmentRequest;
import com.aicareer.career_mentor_backend.entity.Assessment;
import com.aicareer.career_mentor_backend.service.AssessmentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/assessments")
@CrossOrigin(origins = "http://localhost:5173")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping
    public ResponseEntity<Assessment> saveAssessment(
            @RequestBody AssessmentRequest request) {

        Assessment assessment = new Assessment();

        assessment.setUserId(request.getUserId());
        assessment.setAssessmentType(request.getAssessmentType());
        assessment.setTopTrait(request.getTopTrait());

        return ResponseEntity.ok(
                assessmentService.saveAssessment(assessment)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Assessment>> getUserAssessments(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                assessmentService.getUserAssessments(userId)
        );
    }

    @GetMapping("/user/{userId}/latest")
    public ResponseEntity<Assessment> getLatestAssessment(
            @PathVariable Long userId) {

        return assessmentService.getLatestAssessment(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }
}