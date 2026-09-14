package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.dto.AssessmentRequest;
import com.aicareermentor.backend.dto.AssessmentResponse;
import com.aicareermentor.backend.service.AssessmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/assessment")
@CrossOrigin(origins = "http://localhost:5173")
public class AssessmentController {

    private final AssessmentService assessmentService;

    public AssessmentController(AssessmentService assessmentService) {
        this.assessmentService = assessmentService;
    }

    @PostMapping("/submit")
    public ResponseEntity<AssessmentResponse> submitAssessment(
            @Valid @RequestBody AssessmentRequest request
    ) {

        AssessmentResponse response =
                assessmentService.submitAssessment(request);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
