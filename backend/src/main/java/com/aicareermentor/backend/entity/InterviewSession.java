package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "interview_sessions", indexes = @Index(name = "idx_interview_user", columnList = "userId"))
public class InterviewSession {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public String careerTitle;

    public Integer overall;

    public Integer communication;

    public Integer technical;

    public Integer durationSec;

    public Integer violations;

    public String source;

    @Column(columnDefinition = "LONGTEXT")
    public String payload;

    public Instant createdAt = Instant.now();

    public InterviewSession() {
    }
}
