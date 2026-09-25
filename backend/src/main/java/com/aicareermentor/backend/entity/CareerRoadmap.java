package com.aicareermentor.backend.entity;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "career_roadmaps")
public class CareerRoadmap {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "career_id", nullable = false)
    private Career career;

    @Column(nullable = false, length = 200)
    private String title;

    @Column(length = 2000)
    private String summary;

    @OneToMany(
            mappedBy = "roadmap",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    @OrderBy("stepOrder ASC")
    private List<RoadmapStep> steps = new ArrayList<>();

    public CareerRoadmap() {
    }

    public CareerRoadmap(
            User user,
            Career career,
            String title,
            String summary) {

        this.user = user;
        this.career = career;
        this.title = title;
        this.summary = summary;
    }

    public Long getId() {
        return id;
    }

    public User getUser() {
        return user;
    }

    public Career getCareer() {
        return career;
    }

    public String getTitle() {
        return title;
    }

    public String getSummary() {
        return summary;
    }

    public List<RoadmapStep> getSteps() {
        return steps;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public void setCareer(Career career) {
        this.career = career;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setSummary(String summary) {
        this.summary = summary;
    }

    public void setSteps(List<RoadmapStep> steps) {
        this.steps = steps;
    }
}