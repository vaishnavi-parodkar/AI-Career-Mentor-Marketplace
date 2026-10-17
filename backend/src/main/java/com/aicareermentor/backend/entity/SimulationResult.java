package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "simulation_results")
public class SimulationResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public String careerId;

    @Column(columnDefinition = "LONGTEXT")
    public String choicesJson;

    public Integer energy;

    public Integer results;

    public Integer trust;

    public Integer focusCount;

    public Integer collabCount;

    public Integer learnCount;

    public Instant createdAt = Instant.now();

    public SimulationResult() {
    }
}
