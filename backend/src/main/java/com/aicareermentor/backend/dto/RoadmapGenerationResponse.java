package com.aicareermentor.backend.dto;

import java.util.List;

public record RoadmapGenerationResponse(
        String title,
        String summary,
        List<RoadmapGenerationStep> steps
) {

    public record RoadmapGenerationStep(
            String title,
            String description,
            String type,
            String skillName,
            String recommendations
    ) {
    }
}