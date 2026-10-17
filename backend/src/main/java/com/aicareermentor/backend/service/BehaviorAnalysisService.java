package com.aicareermentor.backend.service;

import com.aicareermentor.backend.ai.AiGatewayService;
import com.aicareermentor.backend.ai.AiRequest;
import com.aicareermentor.backend.ai.AiUnavailableException;
import com.aicareermentor.backend.entity.Assessment;
import com.aicareermentor.backend.entity.SimulationResult;
import com.aicareermentor.backend.repository.AssessmentRepository;
import com.aicareermentor.backend.repository.SimulationResultRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.util.*;

/**
 * Behavioural pattern analysis. Counts come from what the user actually chose in the day-in-the-life
 * simulations (focus / collaborate / learn leanings and the energy-results-trust meters) and are compared
 * with the assessment trait scores. The AI only words the explanation, cautiously.
 */
@Service
public class BehaviorAnalysisService {

    private final SimulationResultRepository simulations;
    private final AssessmentRepository assessments;
    private final AiGatewayService ai;
    private final NotificationService notifications;
    private final ProgressService progress;
    private final ObjectMapper mapper;

    public BehaviorAnalysisService(SimulationResultRepository simulations, AssessmentRepository assessments,
                                   AiGatewayService ai, NotificationService notifications,
                                   ProgressService progress, ObjectMapper mapper) {
        this.simulations = simulations;
        this.assessments = assessments;
        this.ai = ai;
        this.notifications = notifications;
        this.progress = progress;
        this.mapper = mapper;
    }

    public Map<String, Object> save(Long userId, JsonNode body) {
        SimulationResult r = new SimulationResult();
        r.userId = userId;
        r.careerId = body.path("careerId").asText("");
        r.choicesJson = mapper.writeValueAsString(body.path("choices"));
        r.energy = body.path("energy").asInt(0);
        r.results = body.path("results").asInt(0);
        r.trust = body.path("trust").asInt(0);
        int focus = 0, collab = 0, learn = 0;
        for (JsonNode c : body.path("choices")) {
            switch (c.path("lean").asText("")) {
                case "focus" -> focus++;
                case "collab" -> collab++;
                case "learn" -> learn++;
                default -> {
                }
            }
        }
        r.focusCount = focus;
        r.collabCount = collab;
        r.learnCount = learn;
        simulations.save(r);
        progress.evaluateBadges(userId);
        return Map.of("saved", true, "id", r.id);
    }

    public Map<String, Object> analyze(Long userId) {
        List<SimulationResult> runs = simulations.findByUserIdOrderByCreatedAtDesc(userId);
        Assessment a = assessments.findByUserId(userId).orElse(null);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("simulationsCompleted", runs.size());
        if (runs.isEmpty() && a == null) {
            out.put("ready", false);
            out.put("message", "Take the career assessment and try a day-in-the-life simulation to see your patterns.");
            return out;
        }

        int focus = 0, collab = 0, learn = 0, energy = 0, results = 0, trust = 0;
        for (SimulationResult r : runs) {
            focus += r.focusCount;
            collab += r.collabCount;
            learn += r.learnCount;
            energy += r.energy;
            results += r.results;
            trust += r.trust;
        }
        int choices = Math.max(1, focus + collab + learn);
        Map<String, Object> lean = new LinkedHashMap<>();
        lean.put("focus", Math.round(100.0 * focus / choices));
        lean.put("collaboration", Math.round(100.0 * collab / choices));
        lean.put("learning", Math.round(100.0 * learn / choices));
        out.put("workStyle", lean);
        if (!runs.isEmpty()) {
            out.put("averageMeters", Map.of("energy", energy / runs.size(), "results", results / runs.size(), "trust", trust / runs.size()));
        }

        // deterministic indicators
        List<String> indicators = new ArrayList<>();
        if (!runs.isEmpty()) {
            if (focus * 100 / choices >= 45) indicators.add("You lean towards deep, independent work.");
            if (collab * 100 / choices >= 45) indicators.add("You lean towards working through people and communication.");
            if (learn * 100 / choices >= 45) indicators.add("You lean towards learning and process before acting.");
            if (energy / runs.size() < 35) indicators.add("Your simulated days ended with low energy; check which choices drained you.");
            if (trust / runs.size() >= 60) indicators.add("Your choices built team trust.");
        }
        String top = null;
        if (a != null) {
            top = a.getTopTrait();
            if (top != null) {
                boolean consistent = ("analytical".equalsIgnoreCase(top) || "technical".equalsIgnoreCase(top)) && focus >= collab
                        || ("communication".equalsIgnoreCase(top) || "leadership".equalsIgnoreCase(top)) && collab >= focus
                        || "creative".equalsIgnoreCase(top) && learn + collab >= focus;
                indicators.add(consistent
                        ? "Your simulation choices are consistent with your strongest assessment trait (" + top + ")."
                        : "Your simulation choices differ from your strongest assessment trait (" + top + "); try more simulations to see which is more you.");
            }
        }
        out.put("indicators", indicators);
        out.put("topTrait", top);

        String narrative;
        String source;
        try {
            String system = "You explain a learner's work-style patterns cautiously. These are tendencies from a short "
                    + "simulation, not a personality diagnosis; say so. Max 120 words, plain language, 2 concrete next steps.";
            narrative = ai.chat(AiRequest.text("behavior", system, "Work style: " + lean + "\nIndicators: " + indicators
                    + "\nTop assessment trait: " + top, 350)).content();
            source = "ai";
        } catch (AiUnavailableException e) {
            narrative = String.join(" ", indicators) + " These are tendencies from short simulations, not a diagnosis.";
            source = "rules";
        }
        out.put("narrative", narrative);
        out.put("narrativeSource", source);
        out.put("ready", true);
        return out;
    }
}
