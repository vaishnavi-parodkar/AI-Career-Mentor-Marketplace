package com.aicareermentor.backend.ai;

import java.util.List;
import java.util.Map;

/**
 * One AI completion request.
 *
 * @param feature        short label used for usage tracking ("mentor-chat", "resume", ...)
 * @param responseFormat null for plain text, otherwise an OpenAI-style response_format map
 *                       (json_schema or json_object)
 * @param history        optional earlier turns: [{role: user|assistant, content: ...}]
 * @param cacheSeconds   0 = never cache
 */
public record AiRequest(
        String feature,
        String system,
        String user,
        double temperature,
        int maxTokens,
        Map<String, Object> responseFormat,
        List<Map<String, String>> history,
        int cacheSeconds
) {

    public static AiRequest text(String feature, String system, String user, int maxTokens) {
        return new AiRequest(feature, system, user, 0.6, maxTokens, null, List.of(), 0);
    }

    public static AiRequest json(String feature, String system, String user, int maxTokens) {
        return new AiRequest(feature, system, user, 0.4, maxTokens,
                Map.of("type", "json_object"), List.of(), 0);
    }

    public AiRequest withHistory(List<Map<String, String>> newHistory) {
        return new AiRequest(feature, system, user, temperature, maxTokens,
                responseFormat, newHistory == null ? List.of() : newHistory, cacheSeconds);
    }

    public AiRequest withCache(int seconds) {
        return new AiRequest(feature, system, user, temperature, maxTokens,
                responseFormat, history, seconds);
    }
}
