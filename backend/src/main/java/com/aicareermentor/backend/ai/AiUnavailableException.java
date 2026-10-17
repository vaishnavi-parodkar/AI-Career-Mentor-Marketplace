package com.aicareermentor.backend.ai;

/**
 * Thrown when every configured AI provider failed (or none is configured).
 * Extends IllegalStateException on purpose: the existing controllers already map
 * IllegalStateException to a 503 "AI unavailable" response and the frontend then
 * falls back to its offline logic.
 */
public class AiUnavailableException extends IllegalStateException {
    public AiUnavailableException(String message) {
        super(message);
    }
}
