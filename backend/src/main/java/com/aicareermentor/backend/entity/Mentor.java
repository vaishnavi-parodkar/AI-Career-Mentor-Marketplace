package com.aicareermentor.backend.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "mentors")
public class Mentor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization;

    private String description;

    private String experience;

    private Double rating;

    private Boolean available;

    public Mentor() {
    }

    public Long getId() {
        return id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getExperience() {
        return experience;
    }

    public void setExperience(String experience) {
        this.experience = experience;
    }

    public Double getRating() {
        return rating;
    }

    public void setRating(Double rating) {
        this.rating = rating;
    }

    public Boolean getAvailable() {
        return available;
    }

    public void setAvailable(Boolean available) {
        this.available = available;
    }

    // ---- marketplace fields (all optional; added by ddl-auto=update) ----
    @Column(unique = true)
    public String slug;
    public String profession;
    public String category;          // tech | business | people
    @Column(length = 600)
    public String skills;            // comma separated
    public String languages;         // comma separated
    public Integer hourlyRate;       // INR per hour
    public Integer yearsExperience;
    @Column(columnDefinition = "TEXT")
    public String bio;
    public String company;
    public String avatarColor;
    @Column(length = 600)
    public String topics;            // comma separated
    public String availableDays;     // e.g. "MON,TUE,WED,THU,FRI"
    @Column(columnDefinition = "TEXT")
    public String personaPrompt;
    public String careerId;
}
