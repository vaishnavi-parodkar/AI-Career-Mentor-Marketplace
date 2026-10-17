package com.aicareermentor.backend.service;

import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Component;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.InputStream;
import java.util.*;
import java.util.regex.Pattern;

/** Canonical skill names and their aliases; used for resume skill extraction and market-demand counts. */
@Component
public class SkillDictionary {

    private final Map<String, List<Pattern>> patterns = new LinkedHashMap<>();

    public SkillDictionary(ObjectMapper mapper) {
        try (InputStream in = new ClassPathResource("skills-dictionary.json").getInputStream()) {
            JsonNode root = mapper.readTree(in);
            for (Map.Entry<String, JsonNode> e : root.properties()) {
                List<Pattern> list = new ArrayList<>();
                list.add(compile(e.getKey()));
                for (JsonNode alias : e.getValue()) list.add(compile(alias.asText()));
                patterns.put(e.getKey(), list);
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Could not load skills-dictionary.json", ex);
        }
    }

    public Set<String> extract(String text) {
        Set<String> found = new LinkedHashSet<>();
        if (text == null) return found;
        for (Map.Entry<String, List<Pattern>> e : patterns.entrySet()) {
            for (Pattern p : e.getValue()) {
                if (p.matcher(text).find()) {
                    found.add(e.getKey());
                    break;
                }
            }
        }
        return found;
    }

    public Set<String> all() {
        return patterns.keySet();
    }

    private static Pattern compile(String term) {
        String quoted = Pattern.quote(term.toLowerCase());
        // word boundaries that also work for terms ending in + # .
        return Pattern.compile("(?<![a-z0-9])" + quoted + "(?![a-z0-9])", Pattern.CASE_INSENSITIVE);
    }
}
