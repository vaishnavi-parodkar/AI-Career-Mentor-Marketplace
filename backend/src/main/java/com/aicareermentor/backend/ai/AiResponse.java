package com.aicareermentor.backend.ai;

public record AiResponse(String content, String provider, String model, long latencyMs, boolean cached) {
}
