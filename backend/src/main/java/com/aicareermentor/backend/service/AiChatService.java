package com.aicareermentor.backend.service;

import com.aicareermentor.backend.ai.AiGatewayService;
import com.aicareermentor.backend.ai.AiRequest;
import com.aicareermentor.backend.ai.AiResponse;
import com.aicareermentor.backend.ai.AiUnavailableException;
import com.aicareermentor.backend.ai.EmbeddingService;
import com.aicareermentor.backend.entity.Mentor;
import com.aicareermentor.backend.entity.MentorContent;
import com.aicareermentor.backend.repository.MentorContentRepository;
import com.aicareermentor.backend.repository.MentorRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Mentor persona chat (grounded in approved mentor content) and the floating platform assistant.
 * Both answer in the user's language (en / hi / mr ...) and degrade to a rule-based reply
 * when every AI provider is down.
 */
@Service
public class AiChatService {

    private static final Map<String, String> LANGUAGES = Map.of(
            "en", "English", "hi", "Hindi", "mr", "Marathi", "ta", "Tamil", "te", "Telugu",
            "bn", "Bengali", "gu", "Gujarati", "kn", "Kannada");

    private final AiGatewayService ai;
    private final EmbeddingService embeddings;
    private final MentorRepository mentorRepository;
    private final MentorContentRepository contentRepository;
    private final UserContextService userContext;

    public AiChatService(AiGatewayService ai, EmbeddingService embeddings, MentorRepository mentorRepository,
                         MentorContentRepository contentRepository, UserContextService userContext) {
        this.ai = ai;
        this.embeddings = embeddings;
        this.mentorRepository = mentorRepository;
        this.contentRepository = contentRepository;
        this.userContext = userContext;
    }

    public static String languageName(String code) {
        return LANGUAGES.getOrDefault(code == null ? "en" : code.toLowerCase(), "English");
    }

    // ------------------------------------------------------------------
    // Mentor chat (feature 14 + 27)
    // ------------------------------------------------------------------

    public Map<String, Object> mentorChat(Long userId, String mentorKey, String message,
                                          List<Map<String, String>> history, String language) {

        Mentor mentor = findMentor(mentorKey);
        if (mentor == null) throw new IllegalArgumentException("Mentor not found.");

        // Retrieve the most relevant approved mentor-provided notes
        List<MentorContent> notes = contentRepository.findByMentorIdAndApprovedTrue(mentor.getId());
        List<MentorContent> top = new ArrayList<>();
        if (!notes.isEmpty()) {
            List<String> docs = new ArrayList<>();
            for (MentorContent c : notes) docs.add(c.title + ". " + c.body);
            double[] scores = embeddings.similarity(message, docs).scores();
            Integer[] order = new Integer[notes.size()];
            for (int i = 0; i < order.length; i++) order[i] = i;
            Arrays.sort(order, (a, b) -> Double.compare(scores[b], scores[a]));
            for (int i = 0; i < Math.min(3, order.length); i++) {
                if (scores[order[i]] > 0.05) top.add(notes.get(order[i]));
            }
        }

        StringBuilder system = new StringBuilder();
        system.append(mentor.personaPrompt != null && !mentor.personaPrompt.isBlank()
                ? mentor.personaPrompt
                : "You are " + mentor.getName() + ", a " + mentor.getSpecialization() + " mentor.");
        system.append("\nYou are an AI mentor persona, not a real person; say so if asked.");
        system.append("\nReply in ").append(languageName(language)).append(". Keep answers under 180 words, practical and specific.");
        String ctx = userContext.describe(userId);
        if (!ctx.isBlank()) system.append("\nAbout the learner:\n").append(ctx);
        if (!top.isEmpty()) {
            system.append("\nApproved mentor notes (prefer these over general knowledge and say when you use them):\n");
            for (MentorContent c : top) system.append("- ").append(c.title).append(": ").append(c.body).append("\n");
        }

        Map<String, Object> out = new LinkedHashMap<>();
        try {
            AiResponse r = ai.chat(AiRequest.text("mentor-chat", system.toString(), message, 600)
                    .withHistory(trim(history)));
            out.put("reply", r.content());
            out.put("provider", r.provider());
        } catch (AiUnavailableException e) {
            out.put("reply", offlineMentorReply(mentor, message, top));
            out.put("provider", "offline");
        }
        List<String> used = new ArrayList<>();
        for (MentorContent c : top) used.add(c.title);
        out.put("sources", used);
        return out;
    }

    // ------------------------------------------------------------------
    // Floating assistant (feature 14 + 24)
    // ------------------------------------------------------------------

    public Map<String, Object> assistant(Long userId, String message, String page,
                                         List<Map<String, String>> history, String language) {

        StringBuilder system = new StringBuilder();
        system.append("You are Pathwise Assistant, the in-app AI helper of a career guidance platform for students and freshers in India. ");
        system.append("Help with career choices, skills, roadmaps, resumes, interviews, mentors and using the app. ");
        system.append("Pages: /careers, /skill-gap, /roadmap, /mentors, /jobs, /resume, /mock-interview, /progress, /learning, /reports. ");
        system.append("Reply in ").append(languageName(language)).append(", under 150 words. Be concrete.");
        if (page != null && !page.isBlank()) system.append("\nThe user is currently on page: ").append(page);
        String ctx = userContext.describe(userId);
        if (!ctx.isBlank()) system.append("\nAbout the user:\n").append(ctx);

        Map<String, Object> out = new LinkedHashMap<>();
        try {
            AiResponse r = ai.chat(AiRequest.text("assistant", system.toString(), message, 500)
                    .withHistory(trim(history)));
            out.put("reply", r.content());
            out.put("provider", r.provider());
        } catch (AiUnavailableException e) {
            out.put("reply", offlineAssistantReply(message));
            out.put("provider", "offline");
        }
        return out;
    }

    // ------------------------------------------------------------------

    public Mentor findMentor(String key) {
        if (key == null) return null;
        Optional<Mentor> bySlug = mentorRepository.findBySlug(key);
        if (bySlug.isPresent()) return bySlug.get();
        try {
            return mentorRepository.findById(Long.parseLong(key.replace("mentor-", ""))).orElse(null);
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private static List<Map<String, String>> trim(List<Map<String, String>> history) {
        if (history == null) return List.of();
        int from = Math.max(0, history.size() - 10);
        return history.subList(from, history.size());
    }

    private String offlineMentorReply(Mentor mentor, String message, List<MentorContent> notes) {
        String text = message.toLowerCase();
        String base;
        if (!notes.isEmpty()) {
            base = notes.get(0).body;
        } else if (text.contains("interview")) {
            base = "For interviews, explain your thought process out loud and practise with the Mock Interview page.";
        } else if (text.contains("skill") || text.contains("learn")) {
            base = "Pick one core skill, build a small project with it every two weeks, and track it on your roadmap.";
        } else if (text.contains("salary")) {
            base = "Salaries vary by city and experience. Check Market Insights for current ranges.";
        } else {
            base = "Tell me your current skills and target role and I will suggest the next three steps.";
        }
        return base + "\n\n(The AI service is busy right now, so this is a quick offline answer. Try again in a minute.)";
    }

    private String offlineAssistantReply(String message) {
        String t = message.toLowerCase();
        if (t.contains("resume") || t.contains("cv")) return "Open Resume to upload your CV and get an ATS score. (AI is busy; this is an offline tip.)";
        if (t.contains("job")) return "Open Jobs to browse current openings with fresher and experienced filters. (AI is busy; offline tip.)";
        if (t.contains("interview")) return "Open Mock Interview to practise. (AI is busy; offline tip.)";
        if (t.contains("mentor")) return "Open Mentors and use smart search to find a good match. (AI is busy; offline tip.)";
        return "The AI service is busy right now. Try the Careers, Roadmap or Progress pages meanwhile, or ask again in a minute.";
    }
}
