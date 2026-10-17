package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.Assessment;
import com.aicareermentor.backend.entity.Profile;
import com.aicareermentor.backend.repository.AssessmentRepository;
import com.aicareermentor.backend.repository.ProfileRepository;
import org.springframework.stereotype.Service;

/** Builds a compact text description of the user for AI prompts and semantic matching. */
@Service
public class UserContextService {

    private final ProfileRepository profileRepository;
    private final AssessmentRepository assessmentRepository;

    public UserContextService(ProfileRepository profileRepository, AssessmentRepository assessmentRepository) {
        this.profileRepository = profileRepository;
        this.assessmentRepository = assessmentRepository;
    }

    public Profile profile(Long userId) {
        return profileRepository.findByUserId(userId).orElse(null);
    }

    public String describe(Long userId) {
        StringBuilder sb = new StringBuilder();
        Profile p = profile(userId);
        if (p != null) {
            add(sb, "Qualification", p.getQualification());
            add(sb, "Field of study", p.getField());
            add(sb, "Interests", p.getInterests());
            add(sb, "Goal", p.getGoal());
            add(sb, "Current skills", p.getSkills());
            add(sb, "Experience level", p.getExperienceLevel());
            add(sb, "Target role", p.getTargetRole());
        }
        Assessment a = assessmentRepository.findByUserId(userId).orElse(null);
        if (a != null && a.getTopTrait() != null) {
            add(sb, "Strongest trait", a.getTopTrait());
        }
        return sb.toString().trim();
    }

    /** Text used as the "career goal" side of semantic mentor matching. */
    public String goalText(Long userId) {
        Profile p = profile(userId);
        if (p == null) return "";
        return String.join(". ",
                nz(p.getTargetRole()), nz(p.getGoal()), nz(p.getInterests()), nz(p.getSkills())).trim();
    }

    private static void add(StringBuilder sb, String label, String value) {
        if (value != null && !value.isBlank()) sb.append(label).append(": ").append(value).append("\n");
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
