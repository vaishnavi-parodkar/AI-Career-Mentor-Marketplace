package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.entity.Mentor;
import com.aicareermentor.backend.entity.MentorContent;
import com.aicareermentor.backend.repository.MentorRepository;
import com.aicareermentor.backend.security.AuthInterceptor;
import com.aicareermentor.backend.service.AdminService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Everything under /api/admin requires an ADMIN token (enforced in AuthInterceptor). */
@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService admin;
    private final MentorRepository mentors;

    public AdminController(AdminService admin, MentorRepository mentors) {
        this.admin = admin;
        this.mentors = mentors;
    }

    @GetMapping("/stats")
    public Map<String, Object> stats() {
        return admin.stats();
    }

    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return admin.users();
    }

    public record RoleBody(String role) {
    }

    @PatchMapping("/users/{id}/role")
    public Map<String, Object> role(HttpServletRequest req, @PathVariable Long id, @RequestBody RoleBody b) {
        return admin.setRole(AuthInterceptor.userId(req), id, b.role());
    }

    @GetMapping("/content")
    public List<Map<String, Object>> content(@RequestParam(defaultValue = "false") boolean pending) {
        return admin.content(pending);
    }

    public record ContentBody(Long mentorId, String title, String body, Boolean approved) {
    }

    @PostMapping("/content")
    public MentorContent addContent(HttpServletRequest req, @RequestBody ContentBody b) {
        return admin.saveContent(b.mentorId(), b.title(), b.body(), !Boolean.FALSE.equals(b.approved()), "admin:" + AuthInterceptor.userId(req));
    }

    public record ApproveBody(Boolean approved) {
    }

    @PatchMapping("/content/{id}")
    public Map<String, Object> approve(@PathVariable Long id, @RequestBody ApproveBody b) {
        admin.setContentApproved(id, Boolean.TRUE.equals(b.approved()));
        return Map.of("ok", true);
    }

    @DeleteMapping("/content/{id}")
    public Map<String, Object> deleteContent(@PathVariable Long id) {
        admin.deleteContent(id);
        return Map.of("ok", true);
    }

    @GetMapping("/mentors")
    public List<Mentor> mentors() {
        return mentors.findAll();
    }

    @PutMapping("/mentors/{id}")
    public Mentor updateMentor(@PathVariable Long id, @RequestBody Mentor m) {
        Mentor existing = mentors.findById(id).orElseThrow(() -> new IllegalArgumentException("Mentor not found."));
        existing.setName(m.getName() != null ? m.getName() : existing.getName());
        existing.setSpecialization(m.getSpecialization() != null ? m.getSpecialization() : existing.getSpecialization());
        existing.setDescription(m.getDescription());
        existing.setRating(m.getRating());
        existing.setAvailable(m.getAvailable());
        existing.profession = m.profession;
        existing.category = m.category;
        existing.careerId = m.careerId;
        existing.skills = m.skills;
        existing.languages = m.languages;
        existing.hourlyRate = m.hourlyRate;
        existing.yearsExperience = m.yearsExperience;
        existing.bio = m.bio;
        existing.company = m.company;
        existing.topics = m.topics;
        existing.availableDays = m.availableDays;
        existing.personaPrompt = m.personaPrompt;
        return mentors.save(existing);
    }

    public record BroadcastBody(String title, String message) {
    }

    @PostMapping("/broadcast")
    public Map<String, Object> broadcast(@RequestBody BroadcastBody b) {
        return Map.of("sentTo", admin.broadcast(b.title(), b.message()));
    }
}
