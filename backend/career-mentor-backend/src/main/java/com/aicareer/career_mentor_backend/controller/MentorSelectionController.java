package com.aicareer.career_mentor_backend.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.aicareer.career_mentor_backend.entity.Mentor;
import com.aicareer.career_mentor_backend.service.MentorSelectionService;

@RestController
@RequestMapping("/api/mentor-selection")
@CrossOrigin(origins = "http://localhost:5173")
public class MentorSelectionController {

    private final MentorSelectionService mentorSelectionService;

    public MentorSelectionController(
            MentorSelectionService mentorSelectionService) {

        this.mentorSelectionService = mentorSelectionService;
    }

    @GetMapping("/{topTrait}")
    public ResponseEntity<List<Mentor>> getRecommendedMentors(
            @PathVariable String topTrait) {

        return ResponseEntity.ok(
                mentorSelectionService.findMentorsForTrait(topTrait)
        );
    }
}