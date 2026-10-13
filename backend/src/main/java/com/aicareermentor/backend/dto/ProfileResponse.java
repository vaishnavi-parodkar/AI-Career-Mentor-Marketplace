package com.aicareermentor.backend.dto;

public class ProfileResponse {

    private Long id;
    private Long userId;
    private String qualification;
    private String field;
    private Integer gradYear;
    private String interests;
    private String goal;
    private String skills;
    private String currentStatus;
    private String experienceLevel;
    private String targetRole;
    private String about;

    public ProfileResponse() {
    }

    public ProfileResponse(
            Long id,
            Long userId,
            String qualification,
            String field,
            Integer gradYear,
            String interests,
            String goal,
            String skills,
            String currentStatus,
            String experienceLevel,
            String targetRole,
            String about
    ) {
        this.id = id;
        this.userId = userId;
        this.qualification = qualification;
        this.field = field;
        this.gradYear = gradYear;
        this.interests = interests;
        this.goal = goal;
        this.skills = skills;
        this.currentStatus = currentStatus;
        this.experienceLevel = experienceLevel;
        this.targetRole = targetRole;
        this.about = about;
    }

    public Long getId() {
        return id;
    }

    public Long getUserId() {
        return userId;
    }

    public String getQualification() {
        return qualification;
    }

    public String getField() {
        return field;
    }

    public Integer getGradYear() {
        return gradYear;
    }

    public String getInterests() {
        return interests;
    }

    public String getGoal() {
        return goal;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public void setField(String field) {
        this.field = field;
    }

    public void setGradYear(Integer gradYear) {
        this.gradYear = gradYear;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public void setGoal(String goal) {
        this.goal = goal;
    }

    public String getSkills() {
        return skills;
    }

    public void setSkills(String skills) {
        this.skills = skills;
    }

    public String getCurrentStatus() {
        return currentStatus;
    }

    public void setCurrentStatus(String currentStatus) {
        this.currentStatus = currentStatus;
    }

    public String getExperienceLevel() {
        return experienceLevel;
    }

    public void setExperienceLevel(String experienceLevel) {
        this.experienceLevel = experienceLevel;
    }

    public String getTargetRole() {
        return targetRole;
    }

    public void setTargetRole(String targetRole) {
        this.targetRole = targetRole;
    }

    public String getAbout() {
        return about;
    }

    public void setAbout(String about) {
        this.about = about;
    }
}
