package com.aicareermentor.backend.service;

import com.aicareermentor.backend.dto.RoadmapGenerationResponse;
import com.aicareermentor.backend.dto.SkillGapAnalysisItem;
import com.aicareermentor.backend.dto.SkillGapAnalyzeRequest;
import com.aicareermentor.backend.dto.SkillGapAnalysisResponse;
import com.aicareermentor.backend.entity.Career;
import com.aicareermentor.backend.entity.CareerRoadmap;
import com.aicareermentor.backend.entity.RoadmapStep;
import com.aicareermentor.backend.entity.User;
import com.aicareermentor.backend.repository.CareerRepository;
import com.aicareermentor.backend.repository.CareerRoadmapRepository;
import com.aicareermentor.backend.repository.RoadmapStepRepository;
import com.aicareermentor.backend.repository.SkillRepository;
import com.aicareermentor.backend.repository.UserRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.ObjectMapper;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;

@Service
public class CareerRoadmapService {

    private final CareerRoadmapRepository careerRoadmapRepository;
    private final UserRepository userRepository;
    private final CareerRepository careerRepository;
    private final SkillAssessmentService skillAssessmentService;
    private final GroqSkillGapService groqSkillGapService;
    private final SkillRepository skillRepository;
    private final RoadmapStepRepository roadmapStepRepository;
    private final ObjectMapper objectMapper;

    public CareerRoadmapService(
        CareerRoadmapRepository careerRoadmapRepository,
        UserRepository userRepository,
        CareerRepository careerRepository,
        SkillAssessmentService skillAssessmentService,
        GroqSkillGapService groqSkillGapService,
        SkillRepository skillRepository,
        RoadmapStepRepository roadmapStepRepository,
        ObjectMapper objectMapper) {

        this.careerRoadmapRepository = careerRoadmapRepository;
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
        this.skillAssessmentService = skillAssessmentService;
        this.groqSkillGapService = groqSkillGapService;
        this.skillRepository = skillRepository;
        this.roadmapStepRepository = roadmapStepRepository;
        this.objectMapper = objectMapper;
    }

    public CareerRoadmap createRoadmap(
            Long userId,
            String careerId,
            String title,
            String summary) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new IllegalArgumentException("User not found"));

        Career career = careerRepository.findByCareerId(careerId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Career not found"));

        CareerRoadmap roadmap =
                new CareerRoadmap(
                        user,
                        career,
                        title,
                        summary
                );

        return careerRoadmapRepository.save(roadmap);
    }

    public List<CareerRoadmap> getRoadmapsByUser(Long userId) {
        return careerRoadmapRepository.findByUserId(userId);
    }

    public List<CareerRoadmap> getRoadmapsByUserAndCareer(
            Long userId,
            Long careerId) {

        return careerRoadmapRepository
                .findByUserIdAndCareerId(userId, careerId);
    }

    public CareerRoadmap generateRoadmap(
                SkillGapAnalyzeRequest request) {

        SkillGapAnalysisResponse analysis =
                skillAssessmentService.analyzeSkillGap(request);

        User user = userRepository.findById(request.userId())
                .orElseThrow(() ->
                    new IllegalArgumentException("User not found"));

        Career career = careerRepository.findByCareerId(request.careerId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Career not found"));
        
        System.out.println(">>> NEW AI ROADMAP GENERATION CALLED <<<");

        RoadmapGenerationResponse roadmapResponse =
                groqSkillGapService.generateRoadmap(
                        career.getTitle(),
                        analysis,
                        request.resumeContext()
                );

        CareerRoadmap roadmap = new CareerRoadmap(
                user,
                career,
                roadmapResponse.title(),
                roadmapResponse.summary()
        );

        List<SkillGapAnalysisItem> analysisSkills =
                analysis.skills() == null ? List.of() : analysis.skills();

        int stepOrder = 1;

        // Steps grouped by the analysis skill they work on (normalized name).
        Map<String, List<RoadmapStep>> stepsBySkill = new LinkedHashMap<>();

        for (var item : roadmapResponse.steps()) {

                if (item.title() == null || item.title().isBlank()) {
                continue;
                }

                var skill =
                        item.skillName() == null
                                || item.skillName().isBlank()
                                ? null
                                : skillRepository
                                        .findByName(item.skillName())
                                        .orElse(null);

                RoadmapStep step = new RoadmapStep(
                        roadmap,
                        skill,
                        item.title(),
                        item.description(),
                        stepOrder++,
                        item.type(),
                        item.recommendations()
                );

                SkillGapAnalysisItem matched =
                        matchAnalysisSkill(item.skillName(), analysisSkills);

                if (matched != null) {
                        step.setSkillName(matched.skillName());
                        stepsBySkill
                                .computeIfAbsent(
                                        normalize(matched.skillName()),
                                        key -> new ArrayList<>())
                                .add(step);
                } else if (item.skillName() != null
                        && !item.skillName().isBlank()) {
                        step.setSkillName(item.skillName());
                }

                roadmap.getSteps().add(step);
        }

        // Split each skill's gap across the steps that work on it, so that
        // finishing every step for a skill closes exactly that skill's gap.
        List<Map<String, Object>> snapshotSkills = new ArrayList<>();

        for (SkillGapAnalysisItem item : analysisSkills) {

                int current = levelOf(item.currentLevel());
                int required = levelOf(item.requiredLevel());

                Map<String, Object> entry = new LinkedHashMap<>();
                entry.put("skillName", item.skillName());
                entry.put("currentLevel", current);
                entry.put("requiredLevel", required);
                snapshotSkills.add(entry);

                List<RoadmapStep> group =
                        stepsBySkill.get(normalize(item.skillName()));

                if (group == null || group.isEmpty()) {
                        continue;
                }

                int gap = Math.max(0, required - current);
                int base = gap / group.size();
                int extra = gap % group.size();

                for (int i = 0; i < group.size(); i++) {
                        group.get(i).setGapReduction(
                                base + (i < extra ? 1 : 0));
                }
        }

        Map<String, Object> snapshot = new LinkedHashMap<>();
        snapshot.put(
                "overallReadiness",
                analysis.overallReadiness() == null
                        ? 0
                        : analysis.overallReadiness());
        snapshot.put("skills", snapshotSkills);

        roadmap.setGapSnapshot(objectMapper.writeValueAsString(snapshot));

        return careerRoadmapRepository.save(roadmap);
        }

    private SkillGapAnalysisItem matchAnalysisSkill(
            String name,
            List<SkillGapAnalysisItem> items) {

        if (name == null || name.isBlank()) {
            return null;
        }

        String wanted = normalize(name);

        for (SkillGapAnalysisItem item : items) {
            if (normalize(item.skillName()).equals(wanted)) {
                return item;
            }
        }

        for (SkillGapAnalysisItem item : items) {
            String candidate = normalize(item.skillName());

            if (!candidate.isEmpty()
                    && (candidate.contains(wanted)
                    || wanted.contains(candidate))) {
                return item;
            }
        }

        return null;
    }

    private String normalize(String value) {
        return value == null
                ? ""
                : value.trim().toLowerCase(Locale.ROOT);
    }

    private int levelOf(Integer level) {
        return level == null ? 0 : Math.max(0, Math.min(100, level));
    }

    public RoadmapStep updateStepCompletion(
                Long stepId,
                Boolean completed) {

        RoadmapStep step = roadmapStepRepository.findById(stepId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Roadmap step not found"));

        step.setCompleted(completed);

        return roadmapStepRepository.save(step);
        }
}