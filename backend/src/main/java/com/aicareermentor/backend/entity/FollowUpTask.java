package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "follow_up_tasks")
public class FollowUpTask {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public Long bookingId;

    @Column(length = 400)
    public String title;

    public Boolean done = false;

    public Instant createdAt = Instant.now();

    public FollowUpTask() {
    }
}
