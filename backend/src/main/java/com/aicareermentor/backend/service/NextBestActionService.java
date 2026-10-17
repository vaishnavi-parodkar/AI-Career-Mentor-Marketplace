package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.*;
import com.aicareermentor.backend.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Next-best-action engine. Rule-based and explainable: looks at what the user has (and has not) done and
 * proposes up to five concrete actions across courses, projects, mentors and career activities.
 */
@Service
public class NextBestActionService {

    private final ProfileRepository profiles;
    private final AssessmentRepository assessments;
    private final CareerRoadmapRepository roadmaps;
    private final SkillProgressRepository skillProgress;
    private final InterviewSessionRepository interviews;
    private final ResumeAnalysisRepository resumes;
    private final BookingRepository bookings;
    private final FollowUpTaskRepository tasks;
    private final SimulationResultRepository simulations;
    private final MentorSearchService mentorSearch;
    private final LearningResourceService learning;

    public NextBestActionService(ProfileRepository profiles, AssessmentRepository assessments,
                                 CareerRoadmapRepository roadmaps, SkillProgressRepository skillProgress,
                                 InterviewSessionRepository interviews, ResumeAnalysisRepository resumes,
                                 BookingRepository bookings, FollowUpTaskRepository tasks,
                                 SimulationResultRepository simulations, MentorSearchService mentorSearch,
                                 LearningResourceService learning) {
        this.profiles = profiles;
        this.assessments = assessments;
        this.roadmaps = roadmaps;
        this.skillProgress = skillProgress;
        this.interviews = interviews;
        this.resumes = resumes;
        this.bookings = bookings;
        this.tasks = tasks;
        this.simulations = simulations;
        this.mentorSearch = mentorSearch;
        this.learning = learning;
    }

    public List<Map<String, Object>> next(Long userId) {
        List<Map<String, Object>> out = new ArrayList<>();

        Profile profile = profiles.findByUserId(userId).orElse(null);
        if (!ProgressService.profileComplete(profile)) {
            add(out, "profile", "Complete your career profile", "Recommendations and mentor matching get better with a full profile.", "/profile");
        }
        if (assessments.findByUserId(userId).isEmpty()) {
            add(out, "assessment", "Take the career assessment", "It takes a few minutes and unlocks personalised career matches.", "/assessment");
        }

        List<CareerRoadmap> rms = roadmaps.findByUserId(userId);
        if (rms.isEmpty()) {
            add(out, "roadmap", "Run a skill-gap analysis and build your roadmap", "A roadmap turns your goal into dated steps.", "/skill-gap");
        } else {
            for (CareerRoadmap r : rms) {
                List<RoadmapStep> steps = new ArrayList<>(r.getSteps());
                steps.sort(Comparator.comparing(s -> s.getStepOrder() == null ? 0 : s.getStepOrder()));
                for (RoadmapStep s : steps) {
                    if (!Boolean.TRUE.equals(s.getCompleted())) {
                        add(out, "roadmap-step", "Next roadmap step: " + s.getTitle(),
                                "Finishing it closes part of your " + s.getSkillName() + " gap.", "/roadmap");
                        break;
                    }
                }
                if (out.size() > 3) break;
            }
        }

        // weakest tracked skill -> learning resource
        List<SkillProgress> sp = skillProgress.findByUserId(userId);
        sp.sort(Comparator.comparing(s -> s.proficiency == null ? 0 : s.proficiency));
        if (!sp.isEmpty() && sp.get(0).proficiency < 70 && !rms.isEmpty()) {
            String skill = sp.get(0).skillName;
            CareerRoadmap r = rms.get(0);
            if (r.getCareer() != null) {
                for (Map<String, Object> res : learning.forCareer(r.getCareer().getCareerId(), List.of(skill))) {
                    if (String.valueOf(res.get("skills")).toLowerCase().contains(skill.toLowerCase())) {
                        add(out, "learning", "Learn " + skill + ": " + res.get("title"),
                                "Your " + skill + " is at " + sp.get(0).proficiency + "%; this " + res.get("type") + " targets it.",
                                "/learning");
                        break;
                    }
                }
            }
        }

        if (resumes.countByUserId(userId) == 0) {
            add(out, "resume", "Get your resume ATS score", "Upload your CV to see missing keywords and fixes.", "/resume");
        }
        if (interviews.countByUserId(userId) == 0) {
            add(out, "interview", "Practise a mock interview", "Feedback after your first one unlocks improvement tracking.", "/mock-interview");
        }
        if (simulations.countByUserId(userId) == 0) {
            add(out, "simulation", "Try a day-in-the-life simulation", "See whether the day-to-day work suits you.", "/careers");
        }
        if (bookings.countByUserId(userId) == 0) {
            List<Map<String, Object>> m = mentorSearch.search(userId,
                    new MentorSearchService.Filters(null, null, null, null, null, true));
            if (!m.isEmpty()) {
                add(out, "mentor", "Talk to " + m.get(0).get("name") + " (" + m.get(0).get("matchScore") + "% match)",
                        "A mentor session turns your plan into feedback.", "/mentors/" + m.get(0).get("id"));
            }
        }
        for (FollowUpTask t : tasks.findByUserIdOrderByCreatedAtDesc(userId)) {
            if (!Boolean.TRUE.equals(t.done)) {
                add(out, "follow-up", "Follow-up from your mentor: " + t.title, "Open tasks from a session are the quickest wins.", "/sessions");
                break;
            }
        }
        if (out.isEmpty()) {
            add(out, "keep-going", "Keep your streak going", "Review Jobs for roles matching your skills.", "/jobs");
        }
        return out.size() > 5 ? out.subList(0, 5) : out;
    }

    private static void add(List<Map<String, Object>> out, String type, String title, String reason, String link) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("type", type);
        m.put("title", title);
        m.put("reason", reason);
        m.put("link", link);
        out.add(m);
    }
}
