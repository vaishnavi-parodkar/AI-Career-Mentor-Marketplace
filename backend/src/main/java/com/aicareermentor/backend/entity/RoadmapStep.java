package com.aicareermentor.backend.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "roadmap_steps")
public class RoadmapStep {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "roadmap_id", nullable = false)
    @JsonIgnore
    private CareerRoadmap roadmap;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String description;

    @Column(nullable = false)
    private Integer stepOrder;

    @Column(nullable = false, length = 50)
    private String type;

    @Column(nullable = false)
    private Boolean completed = false;

    @Column(length = 2000)
    private String recommendations;

    public RoadmapStep() {
    }

    public RoadmapStep(
            CareerRoadmap roadmap,
            Skill skill,
            String title,
            String description,
            Integer stepOrder,
            String type,
            String recommendations) {

        this.roadmap = roadmap;
        this.skill = skill;
        this.title = title;
        this.description = description;
        this.stepOrder = stepOrder;
        this.type = type;
        this.recommendations = recommendations;
        this.completed = false;
    }

    public Long getId() {
        return id;
    }

    public CareerRoadmap getRoadmap() {
        return roadmap;
    }

    public Skill getSkill() {
        return skill;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Integer getStepOrder() {
        return stepOrder;
    }

    public String getType() {
        return type;
    }

    public Boolean getCompleted() {
        return completed;
    }

    public String getRecommendations() {
        return recommendations;
    }

    public void setRoadmap(CareerRoadmap roadmap) {
        this.roadmap = roadmap;
    }

    public void setSkill(Skill skill) {
        this.skill = skill;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setStepOrder(Integer stepOrder) {
        this.stepOrder = stepOrder;
    }

    public void setType(String type) {
        this.type = type;
    }

    public void setCompleted(Boolean completed) {
        this.completed = completed;
    }

    public void setRecommendations(String recommendations) {
        this.recommendations = recommendations;
    }
}