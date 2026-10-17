package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "notifications", indexes = @Index(name = "idx_notif_user", columnList = "userId"))
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public String type;

    public String title;

    @Column(length = 600)
    public String message;

    public String link;

    @Column(name = "is_read")
    public Boolean read = false;

    public Instant createdAt = Instant.now();

    public Notification() {
    }
}
