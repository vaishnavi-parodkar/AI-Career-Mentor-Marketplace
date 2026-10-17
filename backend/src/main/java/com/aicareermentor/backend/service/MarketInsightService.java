package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.Career;
import com.aicareermentor.backend.repository.CareerRepository;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Live market insights: counts how often each skill appears in current job listings,
 * combined with the stored career data (salary, demand, location).
 */
@Service
public class MarketInsightService {

    private final JobService jobs;
    private final SkillDictionary dictionary;
    private final CareerRepository careers;

    public MarketInsightService(JobService jobs, SkillDictionary dictionary, CareerRepository careers) {
        this.jobs = jobs;
        this.dictionary = dictionary;
        this.careers = careers;
    }

    public Map<String, Object> insights(String careerId) {
        Career career = careerId == null || careerId.isBlank() ? null : careers.findByCareerId(careerId).orElse(null);
        String query = career == null ? "" : career.getTitle();

        List<JobService.Job> pool = jobs.pool(query);
        Map<String, Integer> counts = new HashMap<>();
        int remote = 0, fresher = 0;
        for (JobService.Job j : pool) {
            if (j.remote()) remote++;
            if ("fresher".equals(j.level())) fresher++;
            String text = j.title() + " " + j.excerpt() + " " + String.join(" ", j.tags());
            for (String s : dictionary.extract(text)) counts.merge(s, 1, Integer::sum);
        }

        List<Map<String, Object>> top = new ArrayList<>();
        counts.entrySet().stream()
                .sorted((a, b) -> b.getValue() - a.getValue())
                .limit(12)
                .forEach(e -> top.add(Map.of("skill", e.getKey(), "jobs", e.getValue(),
                        "share", pool.isEmpty() ? 0 : Math.round(100.0 * e.getValue() / pool.size()))));

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("sampleSize", pool.size());
        out.put("remoteShare", pool.isEmpty() ? 0 : Math.round(100.0 * remote / pool.size()));
        out.put("fresherShare", pool.isEmpty() ? 0 : Math.round(100.0 * fresher / pool.size()));
        out.put("topSkills", top);
        out.put("note", "Based on a sample of current listings from free job boards (many are remote/global), "
                + "not a full survey of the Indian market.");
        if (career != null) {
            Map<String, Object> c = new LinkedHashMap<>();
            c.put("careerId", career.getCareerId());
            c.put("title", career.getTitle());
            c.put("salaryRange", career.getSalaryRange());
            c.put("avgSalary", career.getAvgSalary());
            c.put("demand", career.getDemand());
            c.put("topLocation", career.getTopLocation());
            c.put("growth", career.getGrowth());
            c.put("requiredSkills", career.getSkills());
            List<String> required = new ArrayList<>();
            for (String s : career.getSkills().split(",")) required.add(s.trim());
            List<String> inDemand = new ArrayList<>();
            for (String s : required) if (counts.containsKey(s)) inDemand.add(s + " (" + counts.get(s) + " listings)");
            c.put("requiredSkillsSeenInListings", inDemand);
            out.put("career", c);
        }
        return out;
    }
}
