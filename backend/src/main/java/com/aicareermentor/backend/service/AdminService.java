package com.aicareermentor.backend.service;

import com.aicareermentor.backend.ai.AiGatewayService;
import com.aicareermentor.backend.entity.*;
import com.aicareermentor.backend.repository.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.*;

/** Administrative dashboard: platform stats, AI monitoring, user roles, mentor content moderation. */
@Service
public class AdminService {

    private final UserRepository users;
    private final MentorRepository mentors;
    private final MentorContentRepository contents;
    private final AssessmentRepository assessments;
    private final CareerRoadmapRepository roadmaps;
    private final BookingRepository bookings;
    private final InterviewSessionRepository interviews;
    private final ResumeAnalysisRepository resumes;
    private final AiUsageLogRepository usage;
    private final AiGatewayService ai;
    private final NotificationService notifications;

    public AdminService(UserRepository users, MentorRepository mentors, MentorContentRepository contents,
                        AssessmentRepository assessments, CareerRoadmapRepository roadmaps, BookingRepository bookings,
                        InterviewSessionRepository interviews, ResumeAnalysisRepository resumes,
                        AiUsageLogRepository usage, AiGatewayService ai, NotificationService notifications) {
        this.users = users;
        this.mentors = mentors;
        this.contents = contents;
        this.assessments = assessments;
        this.roadmaps = roadmaps;
        this.bookings = bookings;
        this.interviews = interviews;
        this.resumes = resumes;
        this.usage = usage;
        this.ai = ai;
        this.notifications = notifications;
    }

    public Map<String, Object> stats() {
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("users", users.count());
        out.put("mentors", mentors.count());
        out.put("assessments", assessments.count());
        out.put("roadmaps", roadmaps.count());
        out.put("bookings", bookings.count());
        out.put("interviews", interviews.count());
        out.put("resumeAnalyses", resumes.count());
        out.put("pendingContent", contents.findByApprovedFalse().size());

        List<AiUsageLog> day = usage.findByCreatedAtAfter(Instant.now().minus(24, ChronoUnit.HOURS));
        Map<String, long[]> byProvider = new TreeMap<>();
        long totalMs = 0;
        for (AiUsageLog l : day) {
            long[] c = byProvider.computeIfAbsent(l.getProvider(), k -> new long[2]);
            if (Boolean.TRUE.equals(l.getSuccess())) {
                c[0]++;
                totalMs += l.getLatencyMs() == null ? 0 : l.getLatencyMs();
            } else {
                c[1]++;
            }
        }
        List<Map<String, Object>> providers = new ArrayList<>();
        long ok = 0;
        for (Map.Entry<String, long[]> e : byProvider.entrySet()) {
            providers.add(Map.of("provider", e.getKey(), "success", e.getValue()[0], "failed", e.getValue()[1]));
            ok += e.getValue()[0];
        }
        out.put("aiCalls24h", day.size());
        out.put("aiSuccessRate24h", day.isEmpty() ? null : Math.round(100.0 * ok / day.size()));
        out.put("aiAvgLatencyMs24h", ok == 0 ? null : totalMs / ok);
        out.put("aiByProvider24h", providers);
        out.put("aiProviders", ai.providerStatus());

        List<Map<String, Object>> recentErrors = new ArrayList<>();
        for (AiUsageLog l : usage.findTop50ByOrderByCreatedAtDesc()) {
            if (!Boolean.TRUE.equals(l.getSuccess()) && recentErrors.size() < 8) {
                recentErrors.add(Map.of("at", l.getCreatedAt().toString(), "provider", String.valueOf(l.getProvider()),
                        "feature", String.valueOf(l.getFeature()), "error", String.valueOf(l.getErrorMessage())));
            }
        }
        out.put("recentAiErrors", recentErrors);
        return out;
    }

    public List<Map<String, Object>> users() {
        List<Map<String, Object>> out = new ArrayList<>();
        for (User u : users.findAll()) {
            out.add(Map.of("id", u.getId(), "name", u.getName(), "email", u.getEmail(), "role", u.getRole()));
        }
        return out;
    }

    public Map<String, Object> setRole(Long adminId, Long userId, String role) {
        if (!"ADMIN".equals(role) && !"USER".equals(role)) throw new IllegalArgumentException("Role must be USER or ADMIN.");
        if (adminId.equals(userId) && "USER".equals(role)) throw new IllegalArgumentException("You cannot remove your own admin role.");
        User u = users.findById(userId).orElseThrow(() -> new IllegalArgumentException("User not found."));
        u.setRole(role);
        users.save(u);
        return Map.of("id", u.getId(), "role", u.getRole());
    }

    public List<Map<String, Object>> content(boolean pendingOnly) {
        List<Map<String, Object>> out = new ArrayList<>();
        List<MentorContent> list = pendingOnly ? contents.findByApprovedFalse() : contents.findAll();
        for (MentorContent c : list) {
            Mentor m = mentors.findById(c.mentorId).orElse(null);
            Map<String, Object> row = new LinkedHashMap<>();
            row.put("id", c.id);
            row.put("mentorId", c.mentorId);
            row.put("mentorName", m == null ? "?" : m.getName());
            row.put("title", c.title);
            row.put("body", c.body);
            row.put("approved", c.approved);
            row.put("submittedBy", c.submittedBy);
            out.add(row);
        }
        return out;
    }

    public MentorContent saveContent(Long mentorId, String title, String body, boolean approved, String by) {
        if (title == null || title.isBlank() || body == null || body.isBlank()) throw new IllegalArgumentException("Title and text are required.");
        mentors.findById(mentorId).orElseThrow(() -> new IllegalArgumentException("Mentor not found."));
        MentorContent c = new MentorContent();
        c.mentorId = mentorId;
        c.title = title.trim();
        c.body = body.trim();
        c.approved = approved;
        c.submittedBy = by;
        return contents.save(c);
    }

    public void setContentApproved(Long id, boolean approved) {
        MentorContent c = contents.findById(id).orElseThrow(() -> new IllegalArgumentException("Content not found."));
        c.approved = approved;
        contents.save(c);
    }

    public void deleteContent(Long id) {
        contents.deleteById(id);
    }

    public int broadcast(String title, String message) {
        if (title == null || title.isBlank()) throw new IllegalArgumentException("Title is required.");
        int n = 0;
        for (User u : users.findAll()) {
            notifications.create(u.getId(), "ANNOUNCEMENT", title, message, null);
            n++;
        }
        return n;
    }
}
