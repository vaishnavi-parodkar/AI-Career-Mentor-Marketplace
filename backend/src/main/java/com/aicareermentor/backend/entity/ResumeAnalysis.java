package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "resume_analyses")
public class ResumeAnalysis {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public String fileName;

    public String targetRole;

    public Integer atsScore;

    @Column(columnDefinition = "TEXT")
    public String matchedKeywords;

    @Column(columnDefinition = "TEXT")
    public String missingKeywords;

    @Column(columnDefinition = "TEXT")
    public String extractedSkills;

    @Column(columnDefinition = "TEXT")
    public String sectionsJson;

    @Column(columnDefinition = "TEXT")
    public String suggestionsJson;

    public String suggestionSource;

    public Instant createdAt = Instant.now();

    public ResumeAnalysis() {
    }
}
