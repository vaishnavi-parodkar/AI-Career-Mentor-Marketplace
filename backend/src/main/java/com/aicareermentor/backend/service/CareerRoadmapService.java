package com.aicareermentor.backend.service;

import com.aicareermentor.backend.dto.RoadmapGenerationResponse;
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

import java.util.List;

@Service
public class CareerRoadmapService {

    private final CareerRoadmapRepository careerRoadmapRepository;
    private final UserRepository userRepository;
    private final CareerRepository careerRepository;
    private final SkillAssessmentService skillAssessmentService;
    private final GroqSkillGapService groqSkillGapService;
    private final SkillRepository skillRepository;
    private final RoadmapStepRepository roadmapStepRepository;

    public CareerRoadmapService(
        CareerRoadmapRepository careerRoadmapRepository,
        UserRepository userRepository,
        CareerRepository careerRepository,
        SkillAssessmentService skillAssessmentService,
        GroqSkillGapService groqSkillGapService,
        SkillRepository skillRepository,
        RoadmapStepRepository roadmapStepRepository) {

        this.careerRoadmapRepository = careerRoadmapRepository;
        this.userRepository = userRepository;
        this.careerRepository = careerRepository;
        this.skillAssessmentService = skillAssessmentService;
        this.groqSkillGapService = groqSkillGapService;
        this.skillRepository = skillRepository;
        this.roadmapStepRepository = roadmapStepRepository;
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

        int stepOrder = 1;

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

                roadmap.getSteps().add(step);
        }

        return careerRoadmapRepository.save(roadmap);
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