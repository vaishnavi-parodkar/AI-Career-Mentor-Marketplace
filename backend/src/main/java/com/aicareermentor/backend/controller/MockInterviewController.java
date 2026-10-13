package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.dto.MockInterviewDto;
import com.aicareermentor.backend.service.GroqMockInterviewService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/mock-interview")
@CrossOrigin(origins = "http://localhost:5173")
public class MockInterviewController {

    private static final Logger log =
            LoggerFactory.getLogger(MockInterviewController.class);

    private final GroqMockInterviewService mockInterviewService;

    public MockInterviewController(
            GroqMockInterviewService mockInterviewService) {
        this.mockInterviewService = mockInterviewService;
    }

    @PostMapping("/questions")
    public ResponseEntity<Object> generateQuestions(
            @RequestBody MockInterviewDto.QuestionsRequest request) {

        try {
            return ResponseEntity.ok(
                    mockInterviewService.generateQuestions(request)
            );
        } catch (IllegalStateException e) {
            return unavailable(e);
        }
    }

    @PostMapping("/evaluate")
    public ResponseEntity<Object> evaluate(
            @RequestBody MockInterviewDto.EvaluateRequest request) {

        try {
            return ResponseEntity.ok(
                    mockInterviewService.evaluate(request)
            );
        } catch (IllegalStateException e) {
            return unavailable(e);
        }
    }

    // The AI provider failing is not the caller's fault, and its error body
    // should not be echoed to the browser. The frontend falls back to its
    // offline question bank / scorer when it sees this response.
    private ResponseEntity<Object> unavailable(IllegalStateException e) {
        log.warn("Mock interview AI call failed: {}", e.getMessage());

        return ResponseEntity
                .status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(Map.of(
                        "success", false,
                        "message", "The interview AI is unavailable right now."
                ));
    }
}
