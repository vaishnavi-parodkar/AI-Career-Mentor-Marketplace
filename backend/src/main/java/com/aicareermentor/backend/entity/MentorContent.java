package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "mentor_content")
public class MentorContent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long mentorId;

    public String title;

    @Column(columnDefinition = "TEXT")
    public String body;

    public Boolean approved = false;

    public String submittedBy;

    public Instant createdAt = Instant.now();

    public MentorContent() {
    }
}
