package com.aicareermentor.backend.controller;

import com.aicareermentor.backend.entity.FollowUpTask;
import com.aicareermentor.backend.security.AuthInterceptor;
import com.aicareermentor.backend.service.BookingService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) {
        this.service = service;
    }

    @GetMapping("/slots/{mentorId}")
    public List<Map<String, Object>> slots(@PathVariable Long mentorId) {
        return service.slots(mentorId);
    }

    public record BookBody(Long mentorId, String startAt, String topic, String goal) {
    }

    @PostMapping
    public Map<String, Object> book(HttpServletRequest req, @RequestBody BookBody b) {
        return service.book(AuthInterceptor.userId(req), b.mentorId(), b.startAt(), b.topic(), b.goal());
    }

    @GetMapping("/mine")
    public List<Map<String, Object>> mine(HttpServletRequest req) {
        return service.mine(AuthInterceptor.userId(req));
    }

    @DeleteMapping("/{id}")
    public Map<String, Object> cancel(HttpServletRequest req, @PathVariable Long id) {
        service.cancel(AuthInterceptor.userId(req), id);
        return Map.of("cancelled", true);
    }

    @GetMapping("/{id}/ics")
    public ResponseEntity<byte[]> ics(HttpServletRequest req, @PathVariable Long id) {
        String body = service.ics(AuthInterceptor.userId(req), id);
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"mentor-session-" + id + ".ics\"")
                .contentType(MediaType.parseMediaType("text/calendar"))
                .body(body.getBytes(StandardCharsets.UTF_8));
    }

    @PostMapping("/{id}/prepare")
    public Map<String, Object> prepare(HttpServletRequest req, @PathVariable Long id) {
        return service.prepare(AuthInterceptor.userId(req), id);
    }

    public record NotesBody(String notes) {
    }

    @PostMapping("/{id}/summary")
    public Map<String, Object> summary(HttpServletRequest req, @PathVariable Long id, @RequestBody NotesBody b) {
        return service.summarize(AuthInterceptor.userId(req), id, b.notes());
    }

    @GetMapping("/tasks")
    public List<FollowUpTask> tasks(HttpServletRequest req) {
        return service.tasks(AuthInterceptor.userId(req));
    }

    public record DoneBody(Boolean done) {
    }

    @PatchMapping("/tasks/{taskId}")
    public FollowUpTask toggle(HttpServletRequest req, @PathVariable Long taskId, @RequestBody DoneBody b) {
        return service.toggleTask(AuthInterceptor.userId(req), taskId, Boolean.TRUE.equals(b.done()));
    }
}
