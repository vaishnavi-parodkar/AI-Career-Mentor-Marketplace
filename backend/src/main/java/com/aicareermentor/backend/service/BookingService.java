package com.aicareermentor.backend.service;

import com.aicareermentor.backend.ai.AiGatewayService;
import com.aicareermentor.backend.ai.AiRequest;
import com.aicareermentor.backend.ai.AiUnavailableException;
import com.aicareermentor.backend.entity.Booking;
import com.aicareermentor.backend.entity.FollowUpTask;
import com.aicareermentor.backend.entity.Mentor;
import com.aicareermentor.backend.repository.BookingRepository;
import com.aicareermentor.backend.repository.FollowUpTaskRepository;
import com.aicareermentor.backend.repository.MentorRepository;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.*;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Mentor sessions: free-slot generation, booking, calendar export (.ics + "add to Google Calendar" link),
 * AI session preparation, AI discussion summary with follow-up tasks.
 */
@Service
public class BookingService {

    private static final ZoneId IST = ZoneId.of("Asia/Kolkata");
    private static final DateTimeFormatter ICS = DateTimeFormatter.ofPattern("yyyyMMdd'T'HHmmss'Z'").withZone(ZoneOffset.UTC);

    private final BookingRepository bookings;
    private final FollowUpTaskRepository tasks;
    private final MentorRepository mentors;
    private final NotificationService notifications;
    private final AiGatewayService ai;
    private final UserContextService userContext;

    public BookingService(BookingRepository bookings, FollowUpTaskRepository tasks, MentorRepository mentors,
                          NotificationService notifications, AiGatewayService ai, UserContextService userContext) {
        this.bookings = bookings;
        this.tasks = tasks;
        this.mentors = mentors;
        this.notifications = notifications;
        this.ai = ai;
        this.userContext = userContext;
    }

    /** Hourly slots 10:00-17:00 IST for the next 7 days, on the mentor's working days, minus booked ones. */
    public List<Map<String, Object>> slots(Long mentorId) {
        Mentor mentor = mentors.findById(mentorId).orElseThrow(() -> new IllegalArgumentException("Mentor not found."));
        Set<String> days = new HashSet<>();
        for (String d : (mentor.availableDays == null ? "MON,TUE,WED,THU,FRI" : mentor.availableDays).split(","))
            days.add(d.trim().toUpperCase());

        ZonedDateTime now = ZonedDateTime.now(IST);
        Instant from = now.toInstant();
        Instant to = now.plusDays(8).toInstant();
        Set<Instant> taken = new HashSet<>();
        for (Booking b : bookings.findByMentorIdAndStartAtBetweenAndStatusNot(mentorId, from, to, "CANCELLED"))
            taken.add(b.startAt);

        List<Map<String, Object>> out = new ArrayList<>();
        for (int d = 0; d < 7; d++) {
            LocalDate date = now.toLocalDate().plusDays(d);
            String key = date.getDayOfWeek().name().substring(0, 3);
            if (!days.contains(key)) continue;
            for (int hour = 10; hour <= 17; hour++) {
                ZonedDateTime start = date.atTime(hour, 0).atZone(IST);
                if (start.isBefore(now.plusHours(2))) continue;
                Map<String, Object> slot = new LinkedHashMap<>();
                slot.put("startAt", start.toInstant().toString());
                slot.put("label", start.format(DateTimeFormatter.ofPattern("EEE d MMM, h:mm a")) + " IST");
                slot.put("taken", taken.contains(start.toInstant()));
                out.add(slot);
            }
        }
        return out;
    }

    public Map<String, Object> book(Long userId, Long mentorId, String startAt, String topic, String goal) {
        Mentor mentor = mentors.findById(mentorId).orElseThrow(() -> new IllegalArgumentException("Mentor not found."));
        Instant start;
        try {
            start = Instant.parse(startAt);
        } catch (RuntimeException e) {
            throw new IllegalArgumentException("Invalid time slot.");
        }
        if (start.isBefore(Instant.now())) throw new IllegalArgumentException("That time has already passed.");

        boolean offered = false;
        for (Map<String, Object> s : slots(mentorId)) {
            if (start.toString().equals(s.get("startAt")) && !Boolean.TRUE.equals(s.get("taken"))) offered = true;
        }
        if (!offered) throw new IllegalArgumentException("That slot is no longer available.");

        Booking b = new Booking();
        b.userId = userId;
        b.mentorId = mentorId;
        b.startAt = start;
        b.topic = topic == null || topic.isBlank() ? "Career guidance" : topic.trim();
        b.goal = goal;
        bookings.save(b);

        notifications.createWithEmail(userId, "BOOKING", "Session booked with " + mentor.getName(),
                "Your session is confirmed for " + start.atZone(IST).format(DateTimeFormatter.ofPattern("EEE d MMM, h:mm a")) + " IST.",
                "/sessions");
        return toMap(b, mentor);
    }

    public List<Map<String, Object>> mine(Long userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (Booking b : bookings.findByUserIdOrderByStartAtDesc(userId)) {
            out.add(toMap(b, mentors.findById(b.mentorId).orElse(null)));
        }
        return out;
    }

    public void cancel(Long userId, Long bookingId) {
        Booking b = owned(userId, bookingId);
        b.status = "CANCELLED";
        bookings.save(b);
    }

    public String ics(Long userId, Long bookingId) {
        Booking b = owned(userId, bookingId);
        Mentor m = mentors.findById(b.mentorId).orElse(null);
        Instant end = b.startAt.plusSeconds(60L * (b.durationMin == null ? 45 : b.durationMin));
        return "BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//Pathwise//Mentor Session//EN\r\nBEGIN:VEVENT\r\n"
                + "UID:booking-" + b.id + "@pathwise\r\nDTSTAMP:" + ICS.format(Instant.now()) + "\r\n"
                + "DTSTART:" + ICS.format(b.startAt) + "\r\nDTEND:" + ICS.format(end) + "\r\n"
                + "SUMMARY:Mentor session with " + (m == null ? "mentor" : m.getName()) + "\r\n"
                + "DESCRIPTION:" + (b.topic == null ? "" : b.topic.replace("\n", " ")) + "\r\n"
                + "BEGIN:VALARM\r\nTRIGGER:-PT30M\r\nACTION:DISPLAY\r\nDESCRIPTION:Session in 30 minutes\r\nEND:VALARM\r\n"
                + "END:VEVENT\r\nEND:VCALENDAR\r\n";
    }

    public Map<String, Object> prepare(Long userId, Long bookingId) {
        Booking b = owned(userId, bookingId);
        Mentor m = mentors.findById(b.mentorId).orElseThrow();
        String system = "You prepare learners for a mentoring session. Return JSON: "
                + "{\"questions\":[5 sharp questions to ask the mentor],\"bring\":[3 things to bring or prepare],"
                + "\"goals\":[3 outcomes to aim for]}. Be specific to the learner and topic.";
        String user = "Mentor: " + m.getName() + " (" + m.getSpecialization() + ")\nTopic: " + b.topic
                + "\nLearner goal: " + (b.goal == null ? "" : b.goal) + "\nLearner profile:\n" + userContext.describe(userId);
        Map<String, Object> out = new LinkedHashMap<>();
        try {
            JsonNode n = ai.chatJson(AiRequest.json("session-prep", system, user, 700));
            out.put("questions", list(n.path("questions")));
            out.put("bring", list(n.path("bring")));
            out.put("goals", list(n.path("goals")));
            out.put("source", "ai");
        } catch (AiUnavailableException | tools.jackson.core.JacksonException e) {
            out.put("questions", List.of("What skills should I focus on first for " + m.getSpecialization() + "?",
                    "What does a strong portfolio look like for this role?",
                    "How would you plan my next three months?",
                    "Which mistakes do beginners make most often?",
                    "How should I prepare for interviews in this field?"));
            out.put("bring", List.of("Your resume", "Your current roadmap", "One project you want feedback on"));
            out.put("goals", List.of("A clear 30-day plan", "One portfolio project idea", "A list of skills to prioritise"));
            out.put("source", "template");
        }
        b.prepNotes = out.toString();
        bookings.save(b);
        return out;
    }

    public Map<String, Object> summarize(Long userId, Long bookingId, String notes) {
        Booking b = owned(userId, bookingId);
        if (notes == null || notes.isBlank()) throw new IllegalArgumentException("Paste your session notes first.");
        String system = "You summarise a mentoring session. Return JSON: {\"summary\":\"3-4 sentences\","
                + "\"keyInsights\":[up to 4 strings],\"actionItems\":[3 to 6 short, concrete tasks starting with a verb]}.";
        Map<String, Object> out = new LinkedHashMap<>();
        List<String> actions;
        try {
            JsonNode n = ai.chatJson(AiRequest.json("session-summary", system,
                    "Topic: " + b.topic + "\nNotes:\n" + notes, 800));
            out.put("summary", n.path("summary").asText());
            out.put("keyInsights", list(n.path("keyInsights")));
            actions = list(n.path("actionItems"));
            out.put("source", "ai");
        } catch (AiUnavailableException | tools.jackson.core.JacksonException e) {
            String trimmed = notes.length() > 400 ? notes.substring(0, 400) + "..." : notes;
            out.put("summary", "Your notes: " + trimmed);
            out.put("keyInsights", List.of());
            actions = new ArrayList<>();
            for (String line : notes.split("\\r?\\n")) {
                String l = line.trim();
                if (l.toLowerCase().startsWith("todo") || l.startsWith("-") || l.startsWith("*")) {
                    actions.add(l.replaceFirst("^(?i)(todo[:\\s]*|[-*]\\s*)", ""));
                }
            }
            out.put("source", "offline");
        }
        out.put("actionItems", actions);
        b.sessionNotes = notes;
        b.summary = out.get("summary") == null ? null : out.get("summary").toString();
        b.status = "COMPLETED";
        bookings.save(b);

        for (String a : actions) {
            if (a == null || a.isBlank()) continue;
            FollowUpTask t = new FollowUpTask();
            t.userId = userId;
            t.bookingId = bookingId;
            t.title = a.length() > 380 ? a.substring(0, 380) : a;
            tasks.save(t);
        }
        if (!actions.isEmpty()) {
            notifications.create(userId, "TASKS", "New follow-up tasks",
                    actions.size() + " action items were added from your session.", "/sessions");
        }
        return out;
    }

    public List<FollowUpTask> tasks(Long userId) {
        return tasks.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public FollowUpTask toggleTask(Long userId, Long taskId, boolean done) {
        FollowUpTask t = tasks.findById(taskId).orElseThrow(() -> new IllegalArgumentException("Task not found."));
        if (!userId.equals(t.userId)) throw new IllegalArgumentException("Task not found.");
        t.done = done;
        return tasks.save(t);
    }

    // ------------------------------------------------------------------

    private Booking owned(Long userId, Long bookingId) {
        Booking b = bookings.findById(bookingId).orElseThrow(() -> new IllegalArgumentException("Booking not found."));
        if (!userId.equals(b.userId)) throw new IllegalArgumentException("Booking not found.");
        return b;
    }

    private Map<String, Object> toMap(Booking b, Mentor m) {
        Map<String, Object> row = new LinkedHashMap<>();
        row.put("id", b.id);
        row.put("mentorId", b.mentorId);
        row.put("mentorName", m == null ? "Mentor" : m.getName());
        row.put("mentorSlug", m == null ? null : m.slug);
        row.put("startAt", b.startAt.toString());
        row.put("durationMin", b.durationMin);
        row.put("status", b.status);
        row.put("topic", b.topic);
        row.put("goal", b.goal);
        row.put("summary", b.summary);
        row.put("googleCalendarUrl", googleLink(b, m));
        return row;
    }

    private String googleLink(Booking b, Mentor m) {
        Instant end = b.startAt.plusSeconds(60L * (b.durationMin == null ? 45 : b.durationMin));
        String title = "Mentor session with " + (m == null ? "mentor" : m.getName());
        return "https://calendar.google.com/calendar/render?action=TEMPLATE&text="
                + URLEncoder.encode(title, StandardCharsets.UTF_8)
                + "&dates=" + ICS.format(b.startAt) + "/" + ICS.format(end)
                + "&details=" + URLEncoder.encode(b.topic == null ? "" : b.topic, StandardCharsets.UTF_8);
    }

    private static List<String> list(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node != null && node.isArray()) for (JsonNode n : node) out.add(n.asText());
        return out;
    }
}
