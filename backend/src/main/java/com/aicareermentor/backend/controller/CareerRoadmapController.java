package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.dto.SkillGapAnalyzeRequest;
import com.aicareermentor.backend.entity.CareerRoadmap;
import com.aicareermentor.backend.entity.RoadmapStep;
import com.aicareermentor.backend.service.CareerRoadmapService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/roadmaps")
@CrossOrigin(origins = "http://localhost:5173")
public class CareerRoadmapController {

    private final CareerRoadmapService careerRoadmapService;

    public CareerRoadmapController(
            CareerRoadmapService careerRoadmapService) {
        this.careerRoadmapService = careerRoadmapService;
    }

    @PostMapping
    public ResponseEntity<CareerRoadmap> createRoadmap(
            @RequestParam Long userId,
            @RequestParam String careerId,
            @RequestParam String title,
            @RequestParam(required = false) String summary) {

        System.out.println(">>> /api/roadmaps/generate HIT <<<");

        return ResponseEntity.ok(
                careerRoadmapService.createRoadmap(
                        userId,
                        careerId,
                        title,
                        summary
                )
        );
    }

    @PostMapping("/generate")
    public ResponseEntity<CareerRoadmap> generateRoadmap(
            @RequestBody SkillGapAnalyzeRequest request) {

        return ResponseEntity.ok(
                careerRoadmapService.generateRoadmap(request)
        );
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<CareerRoadmap>> getUserRoadmaps(
            @PathVariable Long userId) {

        return ResponseEntity.ok(
                careerRoadmapService.getRoadmapsByUser(userId)
        );
    }

    @GetMapping("/user/{userId}/career/{careerId}")
    public ResponseEntity<List<CareerRoadmap>> getUserCareerRoadmaps(
            @PathVariable Long userId,
            @PathVariable Long careerId) {

        return ResponseEntity.ok(
                careerRoadmapService.getRoadmapsByUserAndCareer(
                        userId,
                        careerId
                )
        );
    }

    @PatchMapping("/steps/{stepId}/completion")
        public ResponseEntity<RoadmapStep> updateStepCompletion(
                @PathVariable Long stepId,
                @RequestParam Boolean completed) {

        return ResponseEntity.ok(
                careerRoadmapService.updateStepCompletion(
                        stepId,
                        completed
                )
        );
        }
}