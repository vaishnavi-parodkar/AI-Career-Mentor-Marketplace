package com.aicareermentor.backend.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public class ProfileRequest {

    @NotNull(message = "User ID is required")
    private Long userId;

    @Size(max = 100, message = "Qualification must not exceed 100 characters")
    private String qualification;

    @Size(max = 150, message = "Field must not exceed 150 characters")
    private String field;

    @Min(value = 2000, message = "Graduation year must be 2000 or later")
    @Max(value = 2100, message = "Graduation year is invalid")
    private Integer gradYear;

    @Size(max = 500, message = "Interests must not exceed 500 characters")
    private String interests;

    @Size(max = 500, message = "Career goal must not exceed 500 characters")
    private String goal;

    @Size(max = 1000, message = "skills must not exceed 1000 characters")
    private String skills;

    @Size(max = 100, message = "currentStatus must not exceed 100 characters")
    private String currentStatus;

    @Size(max = 100, message = "experienceLevel must not exceed 100 characters")
    private String experienceLevel;

    @Size(max = 150, message = "targetRole must not exceed 150 characters")
    private String targetRole;

    @Size(max = 1000, message = "about must not exceed 1000 characters")
    private String about;

    public ProfileRequest() {
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getQualification() {
        return qualification;
    }

    public void setQualification(String qualification) {
        this.qualification = qualification;
    }

    public String getField() {
        return field;
    }

    public void setField(String field) {
        this.field = field;
    }

    public Integer getGradYear() {
        return gradYear;
    }

    public void setGradYear(Integer gradYear) {
        this.gradYear = gradYear;
    }

    public String getInterests() {
        return interests;
    }

    public void setInterests(String interests) {
        this.interests = interests;
    }

    public String getGoal() {
        return goal;
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
