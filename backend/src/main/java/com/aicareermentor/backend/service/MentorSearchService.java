package com.aicareermentor.backend.service;

import com.aicareermentor.backend.ai.EmbeddingService;
import com.aicareermentor.backend.entity.Mentor;
import com.aicareermentor.backend.entity.Profile;
import com.aicareermentor.backend.repository.MentorRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Smart mentor search.
 * 1. Hard filters (category, language, max rate, min rating, availability) run in plain Java.
 * 2. Remaining mentors are scored semantically against the query (or the user's saved career goal)
 *    with embeddings (Voxell -> Cohere -> local), optionally re-ranked with Cohere rerank.
 * 3. Final match score = 60% semantic, 25% skill overlap with the user, 15% rating.
 * Each result carries plain-language reasons.
 */
@Service
public class MentorSearchService {

    private final MentorRepository mentorRepository;
    private final EmbeddingService embeddingService;
    private final UserContextService userContext;

    public MentorSearchService(MentorRepository mentorRepository, EmbeddingService embeddingService,
                               UserContextService userContext) {
        this.mentorRepository = mentorRepository;
        this.embeddingService = embeddingService;
        this.userContext = userContext;
    }

    public record Filters(String query, String category, String language, Integer maxRate,
                          Double minRating, Boolean availableOnly) {
    }

    public List<Map<String, Object>> search(Long userId, Filters f) {

        List<Mentor> pool = new ArrayList<>();
        for (Mentor m : mentorRepository.findAll()) {
            if (f.category() != null && !f.category().isBlank() && !"all".equalsIgnoreCase(f.category())
                    && !f.category().equalsIgnoreCase(nz(m.category))) continue;
            if (f.language() != null && !f.language().isBlank()
                    && !csv(m.languages).contains(f.language().trim().toLowerCase())) continue;
            if (f.maxRate() != null && m.hourlyRate != null && m.hourlyRate > f.maxRate()) continue;
            if (f.minRating() != null && m.getRating() != null && m.getRating() < f.minRating()) continue;
            if (Boolean.TRUE.equals(f.availableOnly()) && !Boolean.TRUE.equals(m.getAvailable())) continue;
            pool.add(m);
        }

        String goal = userContext.goalText(userId);
        boolean typedQuery = f.query() != null && !f.query().isBlank();
        String semanticQuery = typedQuery ? f.query() : goal;

        double[] semantic = new double[pool.size()];
        String engine = "none";
        if (!semanticQuery.isBlank() && !pool.isEmpty()) {
            List<String> docs = new ArrayList<>();
            for (Mentor m : pool) docs.add(doc(m));
            EmbeddingService.Scored scored = embeddingService.similarity(semanticQuery, docs);
            semantic = scored.scores();
            engine = scored.provider();

            double[] rerank = embeddingService.rerank(semanticQuery, docs);
            if (rerank != null) {
                for (int i = 0; i < semantic.length; i++) semantic[i] = 0.5 * semantic[i] + 0.5 * rerank[i];
                engine = engine + "+cohere-rerank";
            }
        }

        // normalise semantic scores to 0..1 across the pool so percentages spread out sensibly
        double max = 0;
        for (double s : semantic) max = Math.max(max, s);

        Set<String> userSkills = userSkills(userId);
        List<Map<String, Object>> out = new ArrayList<>();

        for (int i = 0; i < pool.size(); i++) {
            Mentor m = pool.get(i);
            double sem = max > 0 ? semantic[i] / max : 0;
            List<String> mentorSkills = new ArrayList<>(csvOriginal(m.skills));
            List<String> overlap = new ArrayList<>();
            for (String s : mentorSkills) if (userSkills.contains(s.toLowerCase())) overlap.add(s);
            double skillScore = mentorSkills.isEmpty() ? 0 : Math.min(1, overlap.size() / 3.0);
            double ratingScore = m.getRating() == null ? 0.6 : Math.min(1, m.getRating() / 5.0);

            double total = semanticQuery.isBlank()
                    ? 0.7 * ratingScore + 0.3 * skillScore
                    : 0.6 * sem + 0.25 * skillScore + 0.15 * ratingScore;
            int percent = (int) Math.round(Math.max(35, Math.min(99, 35 + total * 64)));
            if (semanticQuery.isBlank() && userSkills.isEmpty()) percent = (int) Math.round(60 + ratingScore * 30);

            List<String> reasons = new ArrayList<>();
            if (!semanticQuery.isBlank() && sem >= 0.6) {
                reasons.add(typedQuery ? "Their profile closely matches what you searched for"
                        : "Their expertise lines up with your saved career goal");
            }
            if (!overlap.isEmpty()) reasons.add("Shares your skills: " + String.join(", ", overlap));
            if (f.language() != null && !f.language().isBlank()) reasons.add("Speaks " + f.language());
            if (m.getRating() != null && m.getRating() >= 4.7) reasons.add("Highly rated (" + m.getRating() + ")");
            if (m.hourlyRate != null && f.maxRate() != null) reasons.add("Within your budget (Rs. " + m.hourlyRate + "/hr)");
            if (reasons.isEmpty()) reasons.add("Relevant to " + nz(m.getSpecialization()));

            Map<String, Object> row = mentorMap(m);
            row.put("matchScore", percent);
            row.put("matchReasons", reasons);
            row.put("matchEngine", engine);
            out.add(row);
        }

        out.sort((a, b) -> Integer.compare((Integer) b.get("matchScore"), (Integer) a.get("matchScore")));
        return out;
    }

    public static Map<String, Object> mentorMap(Mentor m) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("dbId", m.getId());
        row.put("id", m.slug != null && !m.slug.isBlank() ? m.slug : "mentor-" + m.getId());
        row.put("name", m.getName());
        row.put("profession", m.profession != null ? m.profession : m.getSpecialization());
        row.put("specialization", m.getSpecialization());
        row.put("category", m.category);
        row.put("careerId", m.careerId);
        row.put("description", m.getDescription());
        row.put("bio", m.bio);
        row.put("company", m.company);
        row.put("rating", m.getRating());
        row.put("available", m.getAvailable());
        row.put("hourlyRate", m.hourlyRate);
        row.put("yearsExperience", m.yearsExperience);
        row.put("avatarColor", m.avatarColor == null ? "#0A634D" : m.avatarColor);
        row.put("skills", csvOriginal(m.skills));
        row.put("languages", csvOriginal(m.languages));
        row.put("topics", csvOriginal(m.topics));
        row.put("availableDays", csvOriginal(m.availableDays));
        return row;
    }

    private Set<String> userSkills(Long userId) {
        Set<String> out = new HashSet<>();
        Profile p = userContext.profile(userId);
        if (p != null && p.getSkills() != null) out.addAll(csv(p.getSkills()));
        return out;
    }

    private static String doc(Mentor m) {
        return String.join(". ", nz(m.profession), nz(m.getSpecialization()), nz(m.getDescription()),
                nz(m.bio), "Skills: " + nz(m.skills), "Topics: " + nz(m.topics));
    }

    private static Set<String> csv(String s) {
        Set<String> out = new HashSet<>();
        for (String part : nz(s).split(",")) if (!part.isBlank()) out.add(part.trim().toLowerCase());
        return out;
    }

    private static List<String> csvOriginal(String s) {
        List<String> out = new ArrayList<>();
        for (String part : nz(s).split(",")) if (!part.isBlank()) out.add(part.trim());
        return out;
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
