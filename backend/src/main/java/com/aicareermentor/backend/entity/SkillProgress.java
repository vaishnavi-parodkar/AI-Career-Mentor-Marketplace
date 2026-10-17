package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "skill_progress", uniqueConstraints = @UniqueConstraint(columnNames = {"userId", "skillName"}))
public class SkillProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public String skillName;

    public Integer proficiency = 0;

    public String source;

    public Instant updatedAt = Instant.now();

    public SkillProgress() {
    }
}
