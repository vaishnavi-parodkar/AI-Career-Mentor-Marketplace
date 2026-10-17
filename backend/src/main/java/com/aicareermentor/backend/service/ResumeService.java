package com.aicareermentor.backend.service;

import com.aicareermentor.backend.ai.AiGatewayService;
import com.aicareermentor.backend.ai.AiRequest;
import com.aicareermentor.backend.ai.AiUnavailableException;
import com.aicareermentor.backend.entity.Career;
import com.aicareermentor.backend.entity.ResumeAnalysis;
import com.aicareermentor.backend.repository.CareerRepository;
import com.aicareermentor.backend.repository.ResumeAnalysisRepository;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;

/**
 * Resume analysis. Everything numeric is deterministic and local:
 * text extraction (PDF/DOCX/TXT), section detection, skill extraction, keyword coverage vs the
 * target role (or a pasted job description), contact/length/metrics checks, and the ATS score.
 * The LLM is used only for written suggestions, with a rule-based fallback.
 */
@Service
public class ResumeService {

    private static final Map<String, Pattern> SECTIONS = new LinkedHashMap<>();

    static {
        SECTIONS.put("summary", Pattern.compile("(?im)^\\s*(summary|objective|profile|about me)\\b"));
        SECTIONS.put("education", Pattern.compile("(?im)^\\s*(education|academic)"));
        SECTIONS.put("experience", Pattern.compile("(?im)^\\s*(experience|work experience|internship|employment)"));
        SECTIONS.put("projects", Pattern.compile("(?im)^\\s*(projects?|academic projects?|personal projects?)"));
        SECTIONS.put("skills", Pattern.compile("(?im)^\\s*(skills|technical skills|core competencies)"));
        SECTIONS.put("certifications", Pattern.compile("(?im)^\\s*(certifications?|courses|achievements|awards)"));
    }

    private final SkillDictionary dictionary;
    private final CareerRepository careers;
    private final ResumeAnalysisRepository repository;
    private final AiGatewayService ai;
    private final ObjectMapper mapper;

    public ResumeService(SkillDictionary dictionary, CareerRepository careers, ResumeAnalysisRepository repository,
                         AiGatewayService ai, ObjectMapper mapper) {
        this.dictionary = dictionary;
        this.careers = careers;
        this.repository = repository;
        this.ai = ai;
        this.mapper = mapper;
    }

    public Map<String, Object> analyze(Long userId, MultipartFile file, String pastedText,
                                       String careerId, String jobDescription) throws IOException {

        String text;
        String fileName;
        if (file != null && !file.isEmpty()) {
            fileName = file.getOriginalFilename() == null ? "resume" : file.getOriginalFilename();
            text = extractText(fileName, file.getBytes());
        } else if (pastedText != null && !pastedText.isBlank()) {
            fileName = "pasted-text";
            text = pastedText;
        } else {
            throw new IllegalArgumentException("Upload a PDF, DOCX or TXT resume, or paste its text.");
        }
        if (text.trim().length() < 80) {
            throw new IllegalArgumentException("Could not read enough text from this file. If it is a scanned image, "
                    + "export it as a text-based PDF or paste the text instead.");
        }

        Career career = careerId == null || careerId.isBlank() ? null : careers.findByCareerId(careerId).orElse(null);

        // ---- target keywords ----
        Set<String> targets = new LinkedHashSet<>();
        if (jobDescription != null && !jobDescription.isBlank()) targets.addAll(dictionary.extract(jobDescription));
        if (career != null) for (String s : career.getSkills().split(",")) targets.add(s.trim());

        Set<String> found = dictionary.extract(text);
        String lower = text.toLowerCase();

        List<String> matched = new ArrayList<>();
        List<String> missing = new ArrayList<>();
        for (String t : targets) {
            if (found.contains(t) || lower.contains(t.toLowerCase())) matched.add(t); else missing.add(t);
        }

        // ---- sections ----
        Map<String, Boolean> sections = new LinkedHashMap<>();
        for (Map.Entry<String, Pattern> e : SECTIONS.entrySet()) sections.put(e.getKey(), e.getValue().matcher(text).find());
        int sectionHits = 0;
        for (String key : List.of("education", "experience", "projects", "skills")) if (sections.get(key)) sectionHits++;
        // freshers can substitute projects for experience
        boolean hasEmail = Pattern.compile("[\\w.+-]+@[\\w-]+\\.[\\w.]+").matcher(text).find();
        boolean hasPhone = Pattern.compile("(\\+?\\d[\\d\\s-]{8,}\\d)").matcher(text).find();
        boolean hasLink = lower.contains("linkedin.com") || lower.contains("github.com");
        int words = text.trim().split("\\s+").length;
        Matcher nums = Pattern.compile("\\b\\d+(\\.\\d+)?\\s?(%|x|\\+|k\\b|lpa|users|ms|hours)").matcher(lower);
        int metrics = 0;
        while (nums.find()) metrics++;

        // ---- score ----
        double keywordScore = targets.isEmpty() ? 0.6 : (double) matched.size() / targets.size();
        double sectionScore = sectionHits / 4.0;
        double contactScore = ((hasEmail ? 1 : 0) + (hasPhone ? 1 : 0) + (hasLink ? 1 : 0)) / 3.0;
        double lengthScore = words < 150 ? 0.3 : words < 250 ? 0.7 : words <= 900 ? 1.0 : 0.6;
        double metricScore = Math.min(1, metrics / 3.0);
        int ats = (int) Math.round(100 * (0.45 * keywordScore + 0.2 * sectionScore + 0.1 * contactScore
                + 0.1 * lengthScore + 0.15 * metricScore));

        // ---- findings (deterministic) ----
        List<String> issues = new ArrayList<>();
        if (!hasEmail) issues.add("No email address detected.");
        if (!hasPhone) issues.add("No phone number detected.");
        if (!hasLink) issues.add("Add your LinkedIn or GitHub link.");
        if (!sections.get("skills")) issues.add("Add a clear 'Skills' section so ATS parsers can read your keywords.");
        if (!sections.get("projects") && !sections.get("experience")) issues.add("Add Projects or Experience with outcomes.");
        if (!sections.get("education")) issues.add("Add an 'Education' section.");
        if (metrics < 2) issues.add("Quantify results (for example 'cut load time by 35%').");
        if (words < 200) issues.add("The resume looks short; add detail to projects and internships.");
        if (words > 900) issues.add("The resume is long; keep it to one page for freshers.");
        if (!missing.isEmpty()) issues.add("Missing target keywords: " + String.join(", ", missing.subList(0, Math.min(8, missing.size()))));

        // ---- AI suggestions (optional) ----
        List<String> suggestions;
        String source;
        try {
            String system = "You are an ATS-aware resume coach for Indian students and freshers. Return JSON: "
                    + "{\"suggestions\":[6 concrete, role-specific improvements; include rewrite examples for weak bullets]}.";
            String user = "Target role: " + (career == null ? "not specified" : career.getTitle())
                    + "\nMissing keywords: " + missing + "\nDetected skills: " + found
                    + "\nResume text (truncated):\n" + text.substring(0, Math.min(3500, text.length()));
            JsonNode n = ai.chatJson(AiRequest.json("resume", system, user, 900));
            suggestions = new ArrayList<>();
            for (JsonNode s : n.path("suggestions")) suggestions.add(s.asText());
            source = "ai";
            if (suggestions.isEmpty()) throw new AiUnavailableException("empty");
        } catch (AiUnavailableException | tools.jackson.core.JacksonException e) {
            suggestions = new ArrayList<>(issues);
            if (!missing.isEmpty()) {
                suggestions.add("Where it is true, work these skills into project bullets: "
                        + String.join(", ", missing.subList(0, Math.min(5, missing.size()))) + ".");
            }
            suggestions.add("Start each bullet with an action verb and end with a measurable result.");
            source = "rules";
        }

        // ---- persist ----
        ResumeAnalysis row = new ResumeAnalysis();
        row.userId = userId;
        row.fileName = fileName;
        row.targetRole = career == null ? null : career.getTitle();
        row.atsScore = ats;
        row.matchedKeywords = String.join(",", matched);
        row.missingKeywords = String.join(",", missing);
        row.extractedSkills = String.join(",", found);
        row.sectionsJson = mapper.writeValueAsString(sections);
        row.suggestionsJson = mapper.writeValueAsString(suggestions);
        row.suggestionSource = source;
        repository.save(row);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("id", row.id);
        out.put("fileName", fileName);
        out.put("targetRole", row.targetRole);
        out.put("atsScore", ats);
        out.put("breakdown", Map.of(
                "keywords", Math.round(keywordScore * 100), "sections", Math.round(sectionScore * 100),
                "contact", Math.round(contactScore * 100), "length", Math.round(lengthScore * 100),
                "measurableResults", Math.round(metricScore * 100)));
        out.put("matchedKeywords", matched);
        out.put("missingKeywords", missing);
        out.put("extractedSkills", found);
        out.put("sections", sections);
        out.put("issues", issues);
        out.put("suggestions", suggestions);
        out.put("suggestionSource", source);
        out.put("wordCount", words);
        return out;
    }

    public List<Map<String, Object>> history(Long userId) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (ResumeAnalysis r : repository.findTop10ByUserIdOrderByCreatedAtDesc(userId)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.id);
            m.put("fileName", r.fileName);
            m.put("targetRole", r.targetRole);
            m.put("atsScore", r.atsScore);
            m.put("createdAt", r.createdAt.toString());
            out.add(m);
        }
        return out;
    }

    // ------------------------------------------------------------------

    private String extractText(String fileName, byte[] bytes) throws IOException {
        String name = fileName.toLowerCase();
        if (name.endsWith(".pdf")) {
            try (PDDocument doc = Loader.loadPDF(bytes)) {
                return new PDFTextStripper().getText(doc);
            }
        }
        if (name.endsWith(".docx")) {
            try (ZipInputStream zip = new ZipInputStream(new ByteArrayInputStream(bytes))) {
                ZipEntry entry;
                while ((entry = zip.getNextEntry()) != null) {
                    if ("word/document.xml".equals(entry.getName())) {
                        String xml = new String(zip.readAllBytes(), StandardCharsets.UTF_8);
                        return xml.replace("</w:p>", "\n").replaceAll("<[^>]+>", "")
                                .replace("&amp;", "&").replace("&lt;", "<").replace("&gt;", ">");
                    }
                }
            }
            throw new IllegalArgumentException("This DOCX file could not be read.");
        }
        if (name.endsWith(".txt") || name.endsWith(".md")) return new String(bytes, StandardCharsets.UTF_8);
        throw new IllegalArgumentException("Unsupported file type. Use PDF, DOCX or TXT.");
    }
}
