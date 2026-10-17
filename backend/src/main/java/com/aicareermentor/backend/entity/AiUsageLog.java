package com.aicareermentor.backend.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "ai_usage_logs", indexes = {
        @Index(name = "idx_ai_usage_created", columnList = "createdAt")
})
public class AiUsageLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String provider;
    private String feature;
    private Boolean success;
    private Long latencyMs;

    @Column(length = 500)
    private String errorMessage;

    private Instant createdAt = Instant.now();

    public AiUsageLog() {
    }

    public AiUsageLog(String provider, String feature, boolean success, long latencyMs, String errorMessage) {
        this.provider = provider;
        this.feature = feature;
        this.success = success;
        this.latencyMs = latencyMs;
        this.errorMessage = errorMessage == null ? null
                : errorMessage.substring(0, Math.min(480, errorMessage.length()));
    }

    public Long getId() { return id; }
    public String getProvider() { return provider; }
    public String getFeature() { return feature; }
    public Boolean getSuccess() { return success; }
    public Long getLatencyMs() { return latencyMs; }
    public String getErrorMessage() { return errorMessage; }
    public Instant getCreatedAt() { return createdAt; }
}
