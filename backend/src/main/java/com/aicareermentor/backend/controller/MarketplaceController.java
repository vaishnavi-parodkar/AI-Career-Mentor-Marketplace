package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.entity.Mentor;
import com.aicareermentor.backend.entity.MentorContent;
import com.aicareermentor.backend.repository.MentorContentRepository;
import com.aicareermentor.backend.security.AuthInterceptor;
import com.aicareermentor.backend.service.AiChatService;
import com.aicareermentor.backend.service.MentorSearchService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

/** Mentor marketplace: smart search, single mentor, approved knowledge, mentor chat, floating assistant. */
@RestController
@RequestMapping("/api/marketplace")
public class MarketplaceController {

    private final MentorSearchService search;
    private final AiChatService chat;
    private final MentorContentRepository contents;

    public MarketplaceController(MentorSearchService search, AiChatService chat, MentorContentRepository contents) {
        this.search = search;
        this.chat = chat;
        this.contents = contents;
    }

    @GetMapping("/mentors")
    public List<Map<String, Object>> mentors(HttpServletRequest req,
                                             @RequestParam(required = false) String q,
                                             @RequestParam(required = false) String category,
                                             @RequestParam(required = false) String language,
                                             @RequestParam(required = false) Integer maxRate,
                                             @RequestParam(required = false) Double minRating,
                                             @RequestParam(required = false) Boolean availableOnly) {
        return search.search(AuthInterceptor.userId(req),
                new MentorSearchService.Filters(q, category, language, maxRate, minRating, availableOnly));
    }

    @GetMapping("/mentors/{key}")
    public ResponseEntity<Map<String, Object>> mentor(@PathVariable String key) {
        Mentor m = chat.findMentor(key);
        if (m == null) return ResponseEntity.notFound().build();
        Map<String, Object> row = MentorSearchService.mentorMap(m);
        List<Map<String, String>> notes = new ArrayList<>();
        for (MentorContent c : contents.findByMentorIdAndApprovedTrue(m.getId()))
            notes.add(Map.of("title", c.title, "body", c.body));
        row.put("knowledge", notes);
        return ResponseEntity.ok(row);
    }

    public record ChatBody(String message, List<Map<String, String>> history, String language, String page) {
    }

    @PostMapping("/mentors/{key}/chat")
    public Map<String, Object> mentorChat(HttpServletRequest req, @PathVariable String key, @RequestBody ChatBody body) {
        requireMessage(body);
        return chat.mentorChat(AuthInterceptor.userId(req), key, body.message(), body.history(), body.language());
    }

    @PostMapping("/assistant")
    public Map<String, Object> assistant(HttpServletRequest req, @RequestBody ChatBody body) {
        requireMessage(body);
        return chat.assistant(AuthInterceptor.userId(req), body.message(), body.page(), body.history(), body.language());
    }

    private static void requireMessage(ChatBody body) {
        if (body == null || body.message() == null || body.message().isBlank())
            throw new IllegalArgumentException("Message is required.");
        if (body.message().length() > 2000) throw new IllegalArgumentException("Message is too long.");
    }
}
