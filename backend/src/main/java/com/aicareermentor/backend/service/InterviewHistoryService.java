package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.InterviewSession;
import com.aicareermentor.backend.repository.InterviewSessionRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

/** Persists finished mock interviews so history and trends survive across devices (feature 22 / 30). */
@Service
public class InterviewHistoryService {

    private final InterviewSessionRepository repository;
    private final ProgressService progress;
    private final NotificationService notifications;
    private final ObjectMapper mapper;

    public InterviewHistoryService(InterviewSessionRepository repository, ProgressService progress,
                                   NotificationService notifications, ObjectMapper mapper) {
        this.repository = repository;
        this.progress = progress;
        this.notifications = notifications;
        this.mapper = mapper;
    }

    public Map<String, Object> save(Long userId, JsonNode body) {
        InterviewSession s = new InterviewSession();
        s.userId = userId;
        s.careerTitle = body.path("careerTitle").asText("");
        s.overall = clamp(body.path("overall").asInt(0));
        s.communication = clamp(body.path("communication").asInt(0));
        s.technical = clamp(body.path("technical").asInt(0));
        s.durationSec = body.path("durationSec").asInt(0);
        s.violations = body.path("violations").asInt(0);
        s.source = body.path("source").asText("unknown");
        s.payload = mapper.writeValueAsString(body);
        repository.save(s);
        progress.evaluateBadges(userId);
        notifications.create(userId, "INTERVIEW", "Interview feedback ready",
                "You scored " + s.overall + "% in your " + s.careerTitle + " mock interview.", "/interview-feedback");
        return row(s, false);
    }

    public List<Map<String, Object>> list(Long userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (InterviewSession s : repository.findTop30ByUserIdOrderByCreatedAtDesc(userId)) out.add(row(s, true));
        return out;
    }

    private Map<String, Object> row(InterviewSession s, boolean withPayload) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", s.id);
        m.put("careerTitle", s.careerTitle);
        m.put("overall", s.overall);
        m.put("communication", s.communication);
        m.put("technical", s.technical);
        m.put("durationSec", s.durationSec);
        m.put("violations", s.violations);
        m.put("source", s.source);
        m.put("createdAt", s.createdAt.toString());
        if (withPayload && s.payload != null) {
            try {
                m.put("result", mapper.readTree(s.payload));
            } catch (RuntimeException ignored) {
                // leave out unreadable payloads
            }
        }
        return m;
    }

    private static int clamp(int v) {
        return Math.max(0, Math.min(100, v));
    }
}
