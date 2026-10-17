package com.aicareermentor.backend.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.TimeUnit;

/**
 * Live job listings from free sources: Arbeitnow, Jobicy, Himalayas, The Muse (no key needed)
 * and Adzuna India (when ADZUNA_APP_ID / ADZUNA_APP_KEY are set).
 * Each source fails independently; results are cached for a few minutes.
 */
@Service
public class JobService {

    private static final Logger log = LoggerFactory.getLogger(JobService.class);

    public record Job(String id, String title, String company, String location, boolean remote, String level,
                      String source, String url, String postedAt, String salary, String excerpt, List<String> tags) {
    }

    private record Cached(List<Job> jobs, long at) {
    }

    private final RestClient rest = RestClient.builder().defaultHeader("User-Agent", "Pathwise/1.0").build();
    private final Map<String, Cached> cache = new ConcurrentHashMap<>();

    @Value("${jobs.adzuna.app-id:}") private String adzunaId;
    @Value("${jobs.adzuna.app-key:}") private String adzunaKey;
    @Value("${jobs.cache-minutes:20}") private int cacheMinutes;

    /** @param level "fresher", "experienced" or "all" */
    public Map<String, Object> search(String query, String level, Boolean remoteOnly, String location, String source) {

        List<Job> all = fetchAll(query == null ? "" : query.trim());
        List<Job> out = new ArrayList<>();
        String q = query == null ? "" : query.trim().toLowerCase();
        String loc = location == null ? "" : location.trim().toLowerCase();

        for (Job j : all) {
            if (!"all".equalsIgnoreCase(nz(level)) && !nz(level).isBlank() && !nz(level).equalsIgnoreCase(j.level())) continue;
            if (Boolean.TRUE.equals(remoteOnly) && !j.remote()) continue;
            if (!loc.isBlank() && !(nz(j.location()).toLowerCase().contains(loc) || (j.remote() && loc.equals("remote")))) continue;
            if (source != null && !source.isBlank() && !"all".equalsIgnoreCase(source) && !source.equalsIgnoreCase(j.source())) continue;
            if (!q.isBlank()) {
                String hay = (j.title() + " " + j.company() + " " + String.join(" ", j.tags()) + " " + nz(j.excerpt())).toLowerCase();
                boolean ok = true;
                for (String w : q.split("\\s+")) if (!w.isBlank() && !hay.contains(w)) ok = false;
                if (!ok) continue;
            }
            out.add(j);
        }

        out.sort((a, b) -> nz(b.postedAt()).compareTo(nz(a.postedAt())));
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("total", out.size());
        res.put("jobs", out.size() > 100 ? out.subList(0, 100) : out);
        res.put("sources", sourcesUsed(all));
        return res;
    }

    /** Raw pool used by market insights (no filtering). */
    public List<Job> pool(String query) {
        return fetchAll(query == null ? "" : query.trim());
    }

    // ------------------------------------------------------------------

    private List<Job> fetchAll(String query) {
        String key = query.toLowerCase();
        Cached c = cache.get(key);
        if (c != null && System.currentTimeMillis() - c.at() < TimeUnit.MINUTES.toMillis(cacheMinutes)) return c.jobs();

        List<CompletableFuture<List<Job>>> futures = new ArrayList<>();
        futures.add(CompletableFuture.supplyAsync(() -> safe("arbeitnow", () -> arbeitnow())));
        futures.add(CompletableFuture.supplyAsync(() -> safe("jobicy", () -> jobicy(query))));
        futures.add(CompletableFuture.supplyAsync(() -> safe("himalayas", () -> himalayas(query))));
        futures.add(CompletableFuture.supplyAsync(() -> safe("themuse", () -> muse(query))));
        if (!adzunaId.isBlank() && !adzunaKey.isBlank()) {
            futures.add(CompletableFuture.supplyAsync(() -> safe("adzuna", () -> adzuna(query))));
        }

        List<Job> all = new ArrayList<>();
        Set<String> seen = new HashSet<>();
        for (CompletableFuture<List<Job>> f : futures) {
            try {
                for (Job j : f.get(25, TimeUnit.SECONDS)) {
                    if (seen.add((j.title() + "|" + j.company()).toLowerCase())) all.add(j);
                }
            } catch (Exception e) {
                log.warn("A job source timed out: {}", e.getMessage());
            }
        }
        if (!all.isEmpty()) cache.put(key, new Cached(all, System.currentTimeMillis()));
        else if (c != null) return c.jobs(); // serve stale data rather than nothing
        return all;
    }

    private interface Source {
        List<Job> get();
    }

    private List<Job> safe(String name, Source s) {
        try {
            return s.get();
        } catch (RuntimeException e) {
            log.warn("Job source {} failed: {}", name, e.getMessage());
            return List.of();
        }
    }

    private List<Job> arbeitnow() {
        JsonNode r = rest.get().uri("https://www.arbeitnow.com/api/job-board-api").retrieve().body(JsonNode.class);
        List<Job> out = new ArrayList<>();
        if (r == null) return out;
        for (JsonNode n : r.path("data")) {
            List<String> tags = strings(n.path("tags"));
            tags.addAll(strings(n.path("job_types")));
            String title = n.path("title").asText();
            long created = n.path("created_at").asLong(0);
            out.add(new Job("arbeitnow-" + n.path("slug").asText(), title, n.path("company_name").asText(),
                    n.path("location").asText(), n.path("remote").asBoolean(false), levelOf(title, ""),
                    "arbeitnow", n.path("url").asText(), created > 0 ? Instant.ofEpochSecond(created).toString() : "",
                    null, clip(strip(n.path("description").asText())), tags));
        }
        return out;
    }

    private List<Job> jobicy(String query) {
        String url = "https://jobicy.com/api/v2/remote-jobs?count=50"
                + (query.isBlank() ? "" : "&tag=" + URLEncoder.encode(query, StandardCharsets.UTF_8));
        JsonNode r = rest.get().uri(url).retrieve().body(JsonNode.class);
        List<Job> out = new ArrayList<>();
        if (r == null) return out;
        for (JsonNode n : r.path("jobs")) {
            String title = n.path("jobTitle").asText();
            String salary = n.has("annualSalaryMin") && !n.path("annualSalaryMin").isNull()
                    ? n.path("annualSalaryMin").asText() + " - " + n.path("annualSalaryMax").asText() + " " + n.path("salaryCurrency").asText()
                    : null;
            out.add(new Job("jobicy-" + n.path("id").asText(), title, n.path("companyName").asText(),
                    n.path("jobGeo").asText("Remote"), true, levelOf(title, n.path("jobLevel").asText()),
                    "jobicy", n.path("url").asText(), toIso(n.path("pubDate").asText()), salary,
                    clip(strip(n.path("jobExcerpt").asText())), strings(n.path("jobIndustry"))));
        }
        return out;
    }

    private List<Job> himalayas(String query) {
        String url = "https://himalayas.app/jobs/api?limit=50"
                + (query.isBlank() ? "" : "&q=" + URLEncoder.encode(query, StandardCharsets.UTF_8));
        JsonNode r = rest.get().uri(url).retrieve().body(JsonNode.class);
        List<Job> out = new ArrayList<>();
        if (r == null) return out;
        for (JsonNode n : r.path("jobs")) {
            String title = n.path("title").asText();
            String seniority = String.join(" ", strings(n.path("seniority")));
            String salary = n.path("minSalary").isNumber()
                    ? n.path("minSalary").asText() + " - " + n.path("maxSalary").asText() + " " + n.path("currency").asText() : null;
            long pub = n.path("pubDate").asLong(0);
            List<String> loc = strings(n.path("locationRestrictions"));
            out.add(new Job("himalayas-" + n.path("guid").asText(), title, n.path("companyName").asText(),
                    loc.isEmpty() ? "Remote (worldwide)" : "Remote: " + String.join(", ", loc), true,
                    levelOf(title, seniority), "himalayas", n.path("applicationLink").asText(),
                    pub > 0 ? Instant.ofEpochSecond(pub).toString() : "", salary,
                    clip(strip(n.path("excerpt").asText())), strings(n.path("categories"))));
        }
        return out;
    }

    private List<Job> muse(String query) {
        List<Job> out = new ArrayList<>();
        for (String lvl : List.of("Entry Level", "Mid Level", "Senior Level")) {
            String url = "https://www.themuse.com/api/public/jobs?page=1&level=" + URLEncoder.encode(lvl, StandardCharsets.UTF_8)
                    + (query.isBlank() ? "" : "&category=" + URLEncoder.encode(museCategory(query), StandardCharsets.UTF_8));
            JsonNode r = rest.get().uri(url).retrieve().body(JsonNode.class);
            if (r == null) continue;
            for (JsonNode n : r.path("results")) {
                List<String> locs = new ArrayList<>();
                for (JsonNode l : n.path("locations")) locs.add(l.path("name").asText());
                String location = locs.isEmpty() ? "Not specified" : String.join(" / ", locs);
                out.add(new Job("muse-" + n.path("id").asText(), n.path("name").asText(),
                        n.path("company").path("name").asText(), location,
                        location.toLowerCase().contains("remote") || location.toLowerCase().contains("flexible"),
                        lvl.startsWith("Entry") ? "fresher" : "experienced", "themuse",
                        n.path("refs").path("landing_page").asText(), n.path("publication_date").asText(),
                        null, clip(strip(n.path("contents").asText())), categories(n)));
            }
        }
        return out;
    }

    private List<Job> adzuna(String query) {
        String url = "https://api.adzuna.com/v1/api/jobs/in/search/1?app_id=" + adzunaId + "&app_key=" + adzunaKey
                + "&results_per_page=50&content-type=application/json"
                + (query.isBlank() ? "" : "&what=" + URLEncoder.encode(query, StandardCharsets.UTF_8));
        JsonNode r = rest.get().uri(url).retrieve().body(JsonNode.class);
        List<Job> out = new ArrayList<>();
        if (r == null) return out;
        for (JsonNode n : r.path("results")) {
            String title = n.path("title").asText();
            String salary = n.path("salary_min").isNumber()
                    ? "Rs. " + Math.round(n.path("salary_min").asDouble()) + " - " + Math.round(n.path("salary_max").asDouble()) : null;
            out.add(new Job("adzuna-" + n.path("id").asText(), strip(title), n.path("company").path("display_name").asText(),
                    n.path("location").path("display_name").asText("India"), false, levelOf(title, ""),
                    "adzuna", n.path("redirect_url").asText(), n.path("created").asText(), salary,
                    clip(strip(n.path("description").asText())), List.of(n.path("category").path("label").asText())));
        }
        return out;
    }

    // ------------------------------------------------------------------

    static String levelOf(String title, String hint) {
        String t = (nz(title) + " " + nz(hint)).toLowerCase();
        if (t.matches(".*\\b(intern|internship|graduate|fresher|entry|junior|jr\\.?|trainee|associate|apprentice)\\b.*")) return "fresher";
        return "experienced";
    }

    private static String museCategory(String q) {
        String t = q.toLowerCase();
        if (t.contains("data")) return "Data and Analytics";
        if (t.contains("product")) return "Product Management";
        if (t.contains("hr") || t.contains("human")) return "HR & Recruiting";
        if (t.contains("project")) return "Project Management";
        return "Software Engineering";
    }

    private static List<String> categories(JsonNode n) {
        List<String> out = new ArrayList<>();
        for (JsonNode c : n.path("categories")) out.add(c.path("name").asText());
        return out;
    }

    private static List<String> strings(JsonNode node) {
        List<String> out = new ArrayList<>();
        if (node == null) return out;
        if (node.isArray()) for (JsonNode n : node) out.add(n.asText());
        else if (!node.isNull() && !node.isObject() && !node.asText().isBlank()) out.add(node.asText());
        return out;
    }

    private static String toIso(String date) {
        return date == null ? "" : date.replace(' ', 'T');
    }

    static String strip(String html) {
        return html == null ? "" : html.replaceAll("<[^>]*>", " ").replaceAll("&nbsp;|&amp;|&#?\\w+;", " ").replaceAll("\\s+", " ").trim();
    }

    private static String clip(String s) {
        return s.length() > 400 ? s.substring(0, 400) + "..." : s;
    }

    private static List<String> sourcesUsed(List<Job> jobs) {
        Set<String> s = new TreeSet<>();
        for (Job j : jobs) s.add(j.source());
        return new ArrayList<>(s);
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
