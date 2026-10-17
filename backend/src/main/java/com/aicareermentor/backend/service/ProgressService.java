package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.*;
import com.aicareermentor.backend.repository.*;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * Career-readiness dashboard data, automatic skill-progress updates and persisted badges.
 *
 * Skill progress comes from the roadmap: each completed step closes part of the skill gap that
 * the gap analysis stored in roadmap.gapSnapshot. Badges are re-evaluated whenever something
 * changes and newly earned ones create a notification.
 */
@Service
public class ProgressService {

    private final CareerRoadmapRepository roadmaps;
    private final SkillProgressRepository skillProgress;
    private final UserBadgeRepository badges;
    private final AssessmentRepository assessments;
    private final ProfileRepository profiles;
    private final InterviewSessionRepository interviews;
    private final ResumeAnalysisRepository resumes;
    private final BookingRepository bookings;
    private final SimulationResultRepository simulations;
    private final FollowUpTaskRepository tasks;
    private final NotificationService notifications;
    private final ObjectMapper mapper;

    public ProgressService(CareerRoadmapRepository roadmaps, SkillProgressRepository skillProgress,
                           UserBadgeRepository badges, AssessmentRepository assessments, ProfileRepository profiles,
                           InterviewSessionRepository interviews, ResumeAnalysisRepository resumes,
                           BookingRepository bookings, SimulationResultRepository simulations,
                           FollowUpTaskRepository tasks, NotificationService notifications, ObjectMapper mapper) {
        this.roadmaps = roadmaps;
        this.skillProgress = skillProgress;
        this.badges = badges;
        this.assessments = assessments;
        this.profiles = profiles;
        this.interviews = interviews;
        this.resumes = resumes;
        this.bookings = bookings;
        this.simulations = simulations;
        this.tasks = tasks;
        this.notifications = notifications;
        this.mapper = mapper;
    }

    /** Called after a roadmap step is ticked/unticked. */
    public void onStepChanged(RoadmapStep step) {
        try {
            if (step.getRoadmap() == null || step.getRoadmap().getUser() == null) return;
            Long userId = step.getRoadmap().getUser().getId();
            recomputeSkills(userId);
            evaluateBadges(userId);
            if (Boolean.TRUE.equals(step.getCompleted())) {
                notifications.create(userId, "MILESTONE", "Step completed",
                        "Nice work finishing \"" + step.getTitle() + "\".", "/roadmap");
            }
        } catch (RuntimeException ignored) {
            // progress tracking must never break the main request
        }
    }

    /** Rebuilds per-skill proficiency (0-100) from every roadmap's gap snapshot and completed steps. */
    public void recomputeSkills(Long userId) {
        Map<String, Integer> best = new LinkedHashMap<>();
        for (CareerRoadmap r : roadmaps.findByUserId(userId)) {
            if (r.getGapSnapshot() == null || r.getGapSnapshot().isBlank()) continue;
            try {
                JsonNode snap = mapper.readTree(r.getGapSnapshot());
                for (JsonNode s : snap.path("skills")) {
                    String name = s.path("skillName").asText();
                    double baseline = s.path("currentLevel").asDouble(0);
                    double required = s.path("requiredLevel").asDouble(0);
                    if (name.isBlank() || required <= 0) continue;
                    double baseGap = Math.max(0, required - baseline);
                    double closed = 0;
                    for (RoadmapStep st : r.getSteps()) {
                        if (name.equalsIgnoreCase(st.getSkillName()) && Boolean.TRUE.equals(st.getCompleted())
                                && st.getGapReduction() != null) closed += st.getGapReduction();
                    }
                    double current = baseline + Math.min(closed, baseGap);
                    int percent = (int) Math.round(Math.min(100, 100 * current / required));
                    best.merge(name, percent, Math::max);
                }
            } catch (RuntimeException ignored) {
                // skip unreadable snapshots
            }
        }
        for (Map.Entry<String, Integer> e : best.entrySet()) {
            SkillProgress sp = skillProgress.findByUserIdAndSkillName(userId, e.getKey()).orElseGet(SkillProgress::new);
            sp.userId = userId;
            sp.skillName = e.getKey();
            sp.proficiency = e.getValue();
            sp.source = "roadmap";
            sp.updatedAt = java.time.Instant.now();
            skillProgress.save(sp);
        }
    }

    public List<Map<String, Object>> evaluateBadges(Long userId) {
        List<CareerRoadmap> rms = roadmaps.findByUserId(userId);
        int total = 0, done = 0;
        double bestRatio = 0;
        boolean finished = false;
        for (CareerRoadmap r : rms) {
            int t = r.getSteps().size();
            int d = 0;
            for (RoadmapStep s : r.getSteps()) if (Boolean.TRUE.equals(s.getCompleted())) d++;
            total += t;
            done += d;
            if (t > 0) {
                bestRatio = Math.max(bestRatio, (double) d / t);
                if (d == t) finished = true;
            }
        }
        List<InterviewSession> iv = interviews.findTop30ByUserIdOrderByCreatedAtDesc(userId);
        int bestInterview = 0;
        for (InterviewSession s : iv) bestInterview = Math.max(bestInterview, s.overall == null ? 0 : s.overall);
        int bestAts = 0;
        for (ResumeAnalysis a : resumes.findTop10ByUserIdOrderByCreatedAtDesc(userId))
            bestAts = Math.max(bestAts, a.atsScore == null ? 0 : a.atsScore);

        boolean profileDone = profileComplete(profiles.findByUserId(userId).orElse(null));
        boolean allSkills100 = false;
        List<SkillProgress> sp = skillProgress.findByUserId(userId);
        if (!sp.isEmpty()) {
            allSkills100 = true;
            for (SkillProgress s : sp) if (s.proficiency == null || s.proficiency < 100) allSkills100 = false;
        }

        List<Object[]> defs = new ArrayList<>();
        defs.add(new Object[]{"profile-pioneer", "Profile Pioneer", "Completed 100% of your profile.", profileDone});
        defs.add(new Object[]{"assessment-taker", "Self Aware", "Completed the career assessment.", assessments.findByUserId(userId).isPresent()});
        defs.add(new Object[]{"pathfinder", "Pathfinder", "Generated your personalised career roadmap.", total > 0});
        defs.add(new Object[]{"first-step", "First Step", "Completed your first roadmap step.", done >= 1});
        defs.add(new Object[]{"halfway", "Halfway There", "Completed half of a roadmap.", bestRatio >= 0.5});
        defs.add(new Object[]{"gap-closer", "Gap Closer", "Closed every skill gap from your analysis.", allSkills100});
        defs.add(new Object[]{"roadmap-finisher", "Roadmap Finisher", "Completed every step of a roadmap.", finished});
        defs.add(new Object[]{"interview-ready", "Interview Ready", "Finished a mock interview.", !iv.isEmpty()});
        defs.add(new Object[]{"interview-ace", "Interview Ace", "Scored 80% or higher in a mock interview.", bestInterview >= 80});
        defs.add(new Object[]{"resume-ready", "Resume Ready", "Reached an ATS score of 70 or more.", bestAts >= 70});
        defs.add(new Object[]{"mentor-connected", "Mentor Connected", "Booked a mentor session.", bookings.countByUserId(userId) > 0});
        defs.add(new Object[]{"explorer", "Career Explorer", "Lived a day in a career simulation.", simulations.countByUserId(userId) > 0});

        Set<String> owned = new HashSet<>();
        for (UserBadge b : badges.findByUserId(userId)) owned.add(b.badgeId);

        List<Map<String, Object>> out = new ArrayList<>();
        for (Object[] d : defs) {
            String id = (String) d[0];
            boolean earned = (Boolean) d[3];
            if (earned && !owned.contains(id)) {
                UserBadge b = new UserBadge();
                b.userId = userId;
                b.badgeId = id;
                b.title = (String) d[1];
                badges.save(b);
                notifications.create(userId, "BADGE", "Badge earned: " + d[1], (String) d[2], "/progress");
                owned.add(id);
            }
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", id);
            m.put("title", d[1]);
            m.put("description", d[2]);
            m.put("earned", owned.contains(id));
            out.add(m);
        }
        return out;
    }

    public Map<String, Object> dashboard(Long userId) {
        recomputeSkills(userId);
        List<Map<String, Object>> badgeList = evaluateBadges(userId);

        Map<String, Object> out = new LinkedHashMap<>();
        Assessment a = assessments.findByUserId(userId).orElse(null);
        if (a != null) {
            out.put("traits", Map.of("analytical", nz(a.getAnalyticalScore()), "technical", nz(a.getTechnicalScore()),
                    "communication", nz(a.getCommunicationScore()), "leadership", nz(a.getLeadershipScore()),
                    "creative", nz(a.getCreativeScore())));
            out.put("topTrait", a.getTopTrait());
        }

        List<Map<String, Object>> skills = new ArrayList<>();
        int skillSum = 0;
        for (SkillProgress s : skillProgress.findByUserId(userId)) {
            skills.add(Map.of("skill", s.skillName, "proficiency", s.proficiency, "source", String.valueOf(s.source)));
            skillSum += s.proficiency;
        }
        out.put("skills", skills);

        List<Map<String, Object>> rms = new ArrayList<>();
        int total = 0, done = 0;
        for (CareerRoadmap r : roadmaps.findByUserId(userId)) {
            int t = r.getSteps().size(), d = 0;
            for (RoadmapStep s : r.getSteps()) if (Boolean.TRUE.equals(s.getCompleted())) d++;
            total += t;
            done += d;
            rms.add(Map.of("id", r.getId(), "title", String.valueOf(r.getTitle()), "total", t, "done", d));
        }
        out.put("roadmaps", rms);
        out.put("stepsTotal", total);
        out.put("stepsDone", done);

        List<InterviewSession> iv = interviews.findTop30ByUserIdOrderByCreatedAtDesc(userId);
        int ivAvg = 0;
        for (InterviewSession s : iv) ivAvg += s.overall == null ? 0 : s.overall;
        out.put("interviewCount", iv.size());
        out.put("interviewAverage", iv.isEmpty() ? null : ivAvg / iv.size());

        int bestAts = 0;
        for (ResumeAnalysis r : resumes.findTop10ByUserIdOrderByCreatedAtDesc(userId))
            bestAts = Math.max(bestAts, r.atsScore == null ? 0 : r.atsScore);
        out.put("bestAtsScore", bestAts == 0 ? null : bestAts);
        out.put("sessionsBooked", bookings.countByUserId(userId));

        int openTasks = 0;
        for (FollowUpTask t : tasks.findByUserIdOrderByCreatedAtDesc(userId)) if (!Boolean.TRUE.equals(t.done)) openTasks++;
        out.put("openTasks", openTasks);

        // Readiness: roadmap 30, skills 25, interviews 15, resume 10, assessment 10, profile 10
        double roadmapPart = total == 0 ? 0 : (double) done / total;
        double skillPart = skills.isEmpty() ? 0 : (double) skillSum / (skills.size() * 100);
        double interviewPart = iv.isEmpty() ? 0 : Math.min(1.0, (double) ivAvg / iv.size() / 100.0);
        double resumePart = Math.min(1.0, bestAts / 100.0);
        boolean profileDone = profileComplete(profiles.findByUserId(userId).orElse(null));
        double[] pts = {30 * roadmapPart, 25 * skillPart, 15 * interviewPart, 10 * resumePart, a != null ? 10 : 0, profileDone ? 10 : 0};
        String[] names = {"Roadmap progress", "Skill proficiency", "Mock interviews", "Resume (ATS)", "Assessment", "Profile"};
        int[] max = {30, 25, 15, 10, 10, 10};
        List<Map<String, Object>> breakdown = new ArrayList<>();
        double sum = 0;
        for (int i = 0; i < pts.length; i++) {
            sum += pts[i];
            breakdown.add(Map.of("label", names[i], "points", (int) Math.round(pts[i]), "max", max[i]));
        }
        int readiness = (int) Math.max(0, Math.min(100, Math.round(sum)));
        out.put("readinessBreakdown", breakdown);
        out.put("readinessScore", readiness);
        out.put("badges", badgeList);
        return out;
    }

    // ------------------------------------------------------------------

    static boolean profileComplete(Profile p) {
        if (p == null) return false;
        return filled(p.getQualification()) && filled(p.getField()) && p.getGradYear() != null
                && filled(p.getInterests()) && filled(p.getGoal()) && filled(p.getSkills())
                && filled(p.getCurrentStatus()) && filled(p.getExperienceLevel()) && filled(p.getTargetRole());
    }

    private static boolean filled(String s) {
        return s != null && !s.isBlank();
    }

    private static double nz(Double d) {
        return d == null ? 0 : d;
    }
}
