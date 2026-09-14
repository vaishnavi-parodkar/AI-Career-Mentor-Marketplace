package com.aicareermentor.backend.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.aicareermentor.backend.entity.Mentor;

@Service
public class MentorSelectionService {

    private final MentorService mentorService;

    public MentorSelectionService(MentorService mentorService) {
        this.mentorService = mentorService;
    }

    public List<Mentor> findMentorsForTrait(String topTrait) {

        return mentorService.getMentorsBySpecialization(topTrait);
    }
}
