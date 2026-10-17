package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "bookings", indexes = @Index(name = "idx_booking_user", columnList = "userId"))
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    public Long id;

    public Long userId;

    public Long mentorId;

    public Instant startAt;

    public Integer durationMin = 45;

    public String status = "CONFIRMED";

    public String topic;

    @Column(columnDefinition = "TEXT")
    public String goal;

    @Column(columnDefinition = "TEXT")
    public String prepNotes;

    @Column(columnDefinition = "TEXT")
    public String summary;

    @Column(columnDefinition = "TEXT")
    public String sessionNotes;

    public Instant createdAt = Instant.now();

    public Booking() {
    }
}
