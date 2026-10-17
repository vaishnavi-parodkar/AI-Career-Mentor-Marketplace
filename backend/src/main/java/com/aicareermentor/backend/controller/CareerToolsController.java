package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.entity.Notification;
import com.aicareermentor.backend.entity.Profile;
import com.aicareermentor.backend.entity.SkillProgress;
import com.aicareermentor.backend.repository.SkillProgressRepository;
import com.aicareermentor.backend.security.AuthInterceptor;
import com.aicareermentor.backend.service.*;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

/** Jobs, market insights, resume, interviews, simulations, progress, learning, notifications, reports. */
@RestController
@RequestMapping("/api")
public class CareerToolsController {

    private final JobService jobs;
    private final MarketInsightService market;
    private final ResumeService resume;
    private final InterviewHistoryService interviews;
    private final BehaviorAnalysisService behavior;
    private final ProgressService progress;
    private final NextBestActionService nextActions;
    private final LearningResourceService learning;
    private final NotificationService notifications;
    private final ReportService reports;
    private final UserContextService userContext;
    private final SkillProgressRepository skillProgress;

    public CareerToolsController(JobService jobs, MarketInsightService market, ResumeService resume,
                                 InterviewHistoryService interviews, BehaviorAnalysisService behavior,
                                 ProgressService progress, NextBestActionService nextActions,
                                 LearningResourceService learning, NotificationService notifications,
                                 ReportService reports, UserContextService userContext,
                                 SkillProgressRepository skillProgress) {
        this.jobs = jobs;
        this.market = market;
        this.resume = resume;
        this.interviews = interviews;
        this.behavior = behavior;
        this.progress = progress;
        this.nextActions = nextActions;
        this.learning = learning;
        this.notifications = notifications;
        this.reports = reports;
        this.userContext = userContext;
        this.skillProgress = skillProgress;
    }

    // ---- jobs & market ----

    @GetMapping("/jobs")
    public Map<String, Object> jobs(@RequestParam(required = false) String q,
                                    @RequestParam(required = false, defaultValue = "all") String level,
                                    @RequestParam(required = false) Boolean remote,
                                    @RequestParam(required = false) String location,
                                    @RequestParam(required = false) String source) {
        return jobs.search(q, level, remote, location, source);
    }

    @GetMapping("/market/insights")
    public Map<String, Object> insights(@RequestParam(required = false) String careerId) {
        return market.insights(careerId);
    }

    // ---- resume ----

    @PostMapping(value = "/resume/analyze", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Object> analyzeResume(HttpServletRequest req,
                                             @RequestParam(required = false) MultipartFile file,
                                             @RequestParam(required = false) String text,
                                             @RequestParam(required = false) String careerId,
                                             @RequestParam(required = false) String jobDescription) throws IOException {
        return resume.analyze(AuthInterceptor.userId(req), file, text, careerId, jobDescription);
    }

    @GetMapping("/resume/history")
    public List<Map<String, Object>> resumeHistory(HttpServletRequest req) {
        return resume.history(AuthInterceptor.userId(req));
    }

    // ---- interviews & simulations ----

    @PostMapping("/interviews")
    public Map<String, Object> saveInterview(HttpServletRequest req, @RequestBody JsonNode body) {
        return interviews.save(AuthInterceptor.userId(req), body);
    }

    @GetMapping("/interviews")
    public List<Map<String, Object>> interviews(HttpServletRequest req) {
        return interviews.list(AuthInterceptor.userId(req));
    }

    @PostMapping("/simulations")
    public Map<String, Object> saveSimulation(HttpServletRequest req, @RequestBody JsonNode body) {
        return behavior.save(AuthInterceptor.userId(req), body);
    }

    @GetMapping("/behavior/analysis")
    public Map<String, Object> behavior(HttpServletRequest req) {
        return behavior.analyze(AuthInterceptor.userId(req));
    }

    // ---- progress ----

    @GetMapping("/progress/dashboard")
    public Map<String, Object> dashboard(HttpServletRequest req) {
        return progress.dashboard(AuthInterceptor.userId(req));
    }

    @GetMapping("/next-actions")
    public List<Map<String, Object>> nextActions(HttpServletRequest req) {
        return nextActions.next(AuthInterceptor.userId(req));
    }

    @GetMapping("/learning")
    public Map<String, Object> learning(HttpServletRequest req, @RequestParam(required = false) String careerId) {
        Long userId = AuthInterceptor.userId(req);
        List<String> weak = new ArrayList<>();
        List<SkillProgress> sp = skillProgress.findByUserId(userId);
        sp.sort(Comparator.comparing(s -> s.proficiency == null ? 0 : s.proficiency));
        for (SkillProgress s : sp) if (s.proficiency != null && s.proficiency < 70) weak.add(s.skillName);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("careers", learning.careerIds());
        out.put("prioritySkills", weak);
        String id = careerId;
        if ((id == null || id.isBlank())) {
            Profile p = userContext.profile(userId);
            id = p == null || p.getTargetRole() == null ? "" : slugFromRole(p.getTargetRole());
        }
        out.put("careerId", id);
        out.put("items", learning.forCareer(id, weak));
        out.put("note", "Fees, availability and syllabus change; confirm on the provider's site before enrolling.");
        return out;
    }

    // ---- notifications ----

    @GetMapping("/notifications")
    public Map<String, Object> notifications(HttpServletRequest req) {
        Long userId = AuthInterceptor.userId(req);
        List<Notification> list = notifications.list(userId);
        return Map.of("unread", notifications.unread(userId), "items", list);
    }

    @PostMapping("/notifications/read-all")
    public Map<String, Object> readAll(HttpServletRequest req) {
        notifications.markAllRead(AuthInterceptor.userId(req));
        return Map.of("ok", true);
    }

    @PostMapping("/notifications/{id}/read")
    public Map<String, Object> read(HttpServletRequest req, @PathVariable Long id) {
        notifications.markRead(AuthInterceptor.userId(req), id);
        return Map.of("ok", true);
    }

    // ---- reports ----

    @GetMapping("/reports/progress.pdf")
    public ResponseEntity<byte[]> pdf(HttpServletRequest req) throws IOException {
        byte[] bytes = reports.pdf(AuthInterceptor.userId(req));
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"career-progress-report.pdf\"")
                .contentType(MediaType.APPLICATION_PDF).body(bytes);
    }

    @GetMapping("/reports/progress.csv")
    public ResponseEntity<byte[]> csv(HttpServletRequest req) {
        byte[] bytes = reports.csv(AuthInterceptor.userId(req)).getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"career-progress-report.csv\"")
                .contentType(MediaType.parseMediaType("text/csv")).body(bytes);
    }

    private static String slugFromRole(String role) {
        String t = role.toLowerCase();
        if (t.contains("data")) return "data-analyst";
        if (t.contains("software") || t.contains("developer") || t.contains("engineer")) return "software-developer";
        if (t.contains("project")) return "project-manager";
        if (t.contains("product")) return "product-manager";
        if (t.contains("hr") || t.contains("human")) return "hr-specialist";
        if (t.contains("security") || t.contains("cyber")) return "cybersecurity-analyst";
        return "";
    }
}
