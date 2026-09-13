package com.aicareer.career_mentor_backend.dto;

public class AssessmentRequest {

    private Long userId;
    private String assessmentType;
    private String topTrait;

    public AssessmentRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getAssessmentType() {
        return assessmentType;
    }

    public void setAssessmentType(String assessmentType) {
        this.assessmentType = assessmentType;
    }

    public String getTopTrait() {
        return topTrait;
    }

    public void setTopTrait(String topTrait) {
        this.topTrait = topTrait;
    }
}