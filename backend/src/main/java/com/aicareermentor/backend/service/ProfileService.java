package com.aicareermentor.backend.service;

import com.aicareermentor.backend.dto.ProfileRequest;
import com.aicareermentor.backend.dto.ProfileResponse;
import com.aicareermentor.backend.entity.Profile;
import com.aicareermentor.backend.repository.ProfileRepository;
import com.aicareermentor.backend.exception.ResourceNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class ProfileService {

    private final ProfileRepository profileRepository;

    public ProfileService(ProfileRepository profileRepository) {
        this.profileRepository = profileRepository;
    }

    // Create or update a user's profile
    public ProfileResponse saveProfile(ProfileRequest request) {

        if (request.getUserId() == null || request.getUserId() <= 0) {
            throw new IllegalArgumentException("Valid user ID is required");
        }

        // Check whether this user already has a profile
        Profile profile = profileRepository
                .findByUserId(request.getUserId())
                .orElse(new Profile());

        // Set/update profile information. Every field except userId is optional so a
        // profile can be saved in parts (onboarding) and completed or edited later.
        profile.setUserId(request.getUserId());
        profile.setQualification(clean(request.getQualification()));
        profile.setField(clean(request.getField()));
        profile.setGradYear(request.getGradYear());
        profile.setInterests(clean(request.getInterests()));
        profile.setGoal(clean(request.getGoal()));
        profile.setSkills(clean(request.getSkills()));
        profile.setCurrentStatus(clean(request.getCurrentStatus()));
        profile.setExperienceLevel(clean(request.getExperienceLevel()));
        profile.setTargetRole(clean(request.getTargetRole()));
        profile.setAbout(clean(request.getAbout()));

        // Save to MySQL
        Profile savedProfile = profileRepository.save(profile);

        return convertToResponse(savedProfile);
    }

    // Get a user's profile
    public ProfileResponse getProfile(Long userId) {

        if (userId == null || userId <= 0) {
            throw new IllegalArgumentException("Valid user ID is required");
        }

        Profile profile = profileRepository
                .findByUserId(userId)
                .orElseThrow(() ->
                        new ResourceNotFoundException("Profile not found for user ID: " + userId)
                );

        return convertToResponse(profile);
    }

    private String clean(String value) {
        if (value == null) return null;
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }

    // Convert Entity → Response DTO
    private ProfileResponse convertToResponse(Profile profile) {

        return new ProfileResponse(
                profile.getId(),
                profile.getUserId(),
                profile.getQualification(),
                profile.getField(),
                profile.getGradYear(),
                profile.getInterests(),
                profile.getGoal(),
                profile.getSkills(),
                profile.getCurrentStatus(),
                profile.getExperienceLevel(),
                profile.getTargetRole(),
                profile.getAbout()
        );
    }
}
