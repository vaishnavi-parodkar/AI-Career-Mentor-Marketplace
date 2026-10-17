package com.aicareermentor.backend.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.*;

/** Curated courses, certifications and projects per career (resources/learning-resources.json). */
@Service
public class LearningResourceService {

    private final JsonNode data;

    public LearningResourceService(ObjectMapper mapper) {
        try (InputStream in = new ClassPathResource("learning-resources.json").getInputStream()) {
            this.data = mapper.readTree(in);
        } catch (Exception e) {
            throw new IllegalStateException("Could not load learning-resources.json", e);
        }
    }

    /** @param skills optional list of skills to put first (for example the user's weakest skills) */
    public List<Map<String, Object>> forCareer(String careerId, Collection<String> prioritySkills) {
        List<Map<String, Object>> out = new ArrayList<>();
        JsonNode list = data.path(careerId == null ? "" : careerId);
        for (JsonNode n : list) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("type", n.path("type").asText());
            m.put("title", n.path("title").asText());
            m.put("provider", n.path("provider").asText());
            m.put("url", n.path("url").asText());
            m.put("free", n.path("free").asBoolean());
            m.put("level", n.path("level").asText());
            m.put("skills", n.path("skills").asText());
            int priority = 0;
            if (prioritySkills != null) {
                for (String s : prioritySkills) if (n.path("skills").asText().toLowerCase().contains(s.toLowerCase())) priority++;
            }
            m.put("_priority", priority);
            out.add(m);
        }
        out.sort((a, b) -> (Integer) b.get("_priority") - (Integer) a.get("_priority"));
        for (Map<String, Object> m : out) m.remove("_priority");
        return out;
    }

    public Set<String> careerIds() {
        Set<String> ids = new LinkedHashSet<>();
        for (Map.Entry<String, JsonNode> e : data.properties()) ids.add(e.getKey());
        return ids;
    }
}
