package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.*;
import com.aicareermentor.backend.repository.*;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.common.PDRectangle;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.*;

/** Downloadable career progress reports: PDF (PDFBox) and CSV, generated entirely in the backend. */
@Service
public class ReportService {

    private final ProgressService progress;
    private final UserRepository users;
    private final ProfileRepository profiles;
    private final InterviewSessionRepository interviews;
    private final ResumeAnalysisRepository resumes;
    private final FollowUpTaskRepository tasks;

    public ReportService(ProgressService progress, UserRepository users, ProfileRepository profiles,
                         InterviewSessionRepository interviews, ResumeAnalysisRepository resumes,
                         FollowUpTaskRepository tasks) {
        this.progress = progress;
        this.users = users;
        this.profiles = profiles;
        this.interviews = interviews;
        this.resumes = resumes;
        this.tasks = tasks;
    }

    @SuppressWarnings("unchecked")
    public byte[] pdf(Long userId) throws IOException {
        Map<String, Object> d = progress.dashboard(userId);
        User user = users.findById(userId).orElseThrow();
        Profile p = profiles.findByUserId(userId).orElse(null);
        int readiness = ((Number) d.get("readinessScore")).intValue();
        List<Map<String, Object>> breakdown = (List<Map<String, Object>>) d.get("readinessBreakdown");
        List<Map<String, Object>> skills = (List<Map<String, Object>>) d.get("skills");
        List<Map<String, Object>> badges = (List<Map<String, Object>>) d.get("badges");
        List<Map<String, Object>> rms = (List<Map<String, Object>>) d.get("roadmaps");
        List<InterviewSession> iv = interviews.findTop30ByUserIdOrderByCreatedAtDesc(userId);
        List<ResumeAnalysis> rs = resumes.findTop10ByUserIdOrderByCreatedAtDesc(userId);

        try (PDDocument doc = new PDDocument()) {
            Pdf pdf = new Pdf(doc);
            pdf.header("Career Progress Report", clean(user.getName()) + "  |  " + clean(user.getEmail()) + "  |  " + LocalDate.now());

            // Readiness hero
            pdf.card(78);
            pdf.text(pdf.x + 16, pdf.y - 14, "CAREER READINESS", Pdf.BOLD, 8, Pdf.MUTED);
            pdf.text(pdf.x + 16, pdf.y - 56, readiness + "%", Pdf.BOLD, 40, Pdf.GREEN);
            String verdict = readiness >= 75 ? "Interview-ready. Focus on polishing and applying."
                    : readiness >= 40 ? "Good momentum. Closing the gaps below will raise this fastest."
                    : "Early stage. Complete roadmap steps, a mock interview and a resume check to grow this.";
            pdf.text(pdf.x + 120, pdf.y - 30, verdict, Pdf.REG, 10.5f, Pdf.DARK);
            pdf.bar(pdf.x + 120, pdf.y - 52, pdf.w - 136, 8, readiness / 100.0);
            pdf.advance(78 + 14);
            if (p != null) {
                pdf.kv("Target role", nz(p.getTargetRole()).isEmpty() ? "Not set" : nz(p.getTargetRole()));
                pdf.kv("Experience", nz(p.getExperienceLevel()) + (nz(p.getCurrentStatus()).isEmpty() ? "" : "  |  " + nz(p.getCurrentStatus())));
                pdf.kv("Education", nz(p.getQualification()) + (nz(p.getField()).isEmpty() ? "" : " in " + nz(p.getField())));
                pdf.kv("Goal", nz(p.getGoal()));
            }
            pdf.kv("Roadmap steps", d.get("stepsDone") + " of " + d.get("stepsTotal") + " completed");
            pdf.kv("Mentor sessions", d.get("sessionsBooked") + " booked  |  " + d.get("openTasks") + " open follow-up tasks");

            pdf.section("How your readiness score is built");
            List<String> weakest = new ArrayList<>();
            for (Map<String, Object> row : breakdown) {
                int pts = ((Number) row.get("points")).intValue(), max = ((Number) row.get("max")).intValue();
                pdf.labelBar(String.valueOf(row.get("label")), pts + " / " + max, max == 0 ? 0 : (double) pts / max);
                if (pts < max * 0.5) weakest.add(String.valueOf(row.get("label")));
            }

            pdf.section("Skill proficiency");
            if (skills.isEmpty()) pdf.para("No skills tracked yet. Run a skill-gap analysis and generate a roadmap; proficiency updates as you complete steps.");
            for (Map<String, Object> sk : skills) {
                int v = ((Number) sk.get("proficiency")).intValue();
                pdf.labelBar(String.valueOf(sk.get("skill")), v + "%", v / 100.0);
            }

            pdf.section("Roadmaps");
            if (rms.isEmpty()) pdf.para("No roadmap generated yet.");
            for (Map<String, Object> r : rms) {
                int t = ((Number) r.get("total")).intValue(), dn = ((Number) r.get("done")).intValue();
                pdf.labelBar(String.valueOf(r.get("title")), dn + " / " + t + " steps", t == 0 ? 0 : (double) dn / t);
            }

            pdf.section("Mock interviews");
            if (iv.isEmpty()) pdf.para("No mock interviews yet. Practising even one lifts your readiness score.");
            else {
                pdf.tableHeader(new String[]{"Date", "Role", "Overall", "Comm.", "Technical"}, new float[]{0, 90, 300, 370, 440});
                for (InterviewSession s : iv.subList(0, Math.min(8, iv.size())))
                    pdf.tableRow(new String[]{s.createdAt.toString().substring(0, 10), clean(nz(s.careerTitle)), s.overall + "%", s.communication + "%", s.technical + "%"}, new float[]{0, 90, 300, 370, 440});
            }

            pdf.section("Resume (ATS) checks");
            if (rs.isEmpty()) pdf.para("No resume analysed yet.");
            else {
                pdf.tableHeader(new String[]{"Date", "Target role", "ATS score"}, new float[]{0, 90, 380});
                for (ResumeAnalysis r : rs.subList(0, Math.min(4, rs.size())))
                    pdf.tableRow(new String[]{r.createdAt.toString().substring(0, 10), clean(nz(r.targetRole)), String.valueOf(r.atsScore)}, new float[]{0, 90, 380});
            }

            pdf.section("Recommended next steps");
            List<String> next = new ArrayList<>();
            if (((Number) d.get("stepsTotal")).intValue() == 0) next.add("Run a skill-gap analysis and generate your personalised roadmap.");
            else if (((Number) d.get("stepsDone")).intValue() < ((Number) d.get("stepsTotal")).intValue()) next.add("Complete your next roadmap step; roadmap progress carries the most weight (30 points).");
            if (iv.isEmpty()) next.add("Take a mock interview to benchmark your communication and technical answers.");
            if (rs.isEmpty()) next.add("Upload your resume for an ATS check against your target role.");
            if (p == null || nz(p.getTargetRole()).isEmpty()) next.add("Set a target role on your profile so recommendations aim at it.");
            if (next.isEmpty()) next.add("Keep going: book a mentor session and apply to roles that match your strongest skills.");
            for (String n : next) pdf.bullet(n);

            pdf.section("Badges");
            long earned = badges.stream().filter(b -> Boolean.TRUE.equals(b.get("earned"))).count();
            pdf.para(earned + " of " + badges.size() + " earned");
            for (Map<String, Object> b : badges)
                pdf.bullet((Boolean.TRUE.equals(b.get("earned")) ? "Earned: " : "Locked: ") + b.get("title") + " - " + b.get("description"));

            pdf.finish();
            ByteArrayOutputStream out = new ByteArrayOutputStream();
            doc.save(out);
            return out.toByteArray();
        }
    }

    @SuppressWarnings("unchecked")
    public String csv(Long userId) {
        Map<String, Object> d = progress.dashboard(userId);
        StringBuilder sb = new StringBuilder();
        sb.append("section,item,value,detail\n");
        row(sb, "overview", "readiness_score", d.get("readinessScore"), "");
        row(sb, "overview", "roadmap_steps_done", d.get("stepsDone"), "of " + d.get("stepsTotal"));
        row(sb, "overview", "sessions_booked", d.get("sessionsBooked"), "");
        row(sb, "overview", "open_followup_tasks", d.get("openTasks"), "");
        for (Map<String, Object> s : (List<Map<String, Object>>) d.get("skills"))
            row(sb, "skill", s.get("skill"), s.get("proficiency"), "percent");
        for (InterviewSession s : interviews.findTop30ByUserIdOrderByCreatedAtDesc(userId))
            row(sb, "interview", s.careerTitle, s.overall, s.createdAt.toString().substring(0, 10)
                    + " comm " + s.communication + " tech " + s.technical);
        for (ResumeAnalysis r : resumes.findTop10ByUserIdOrderByCreatedAtDesc(userId))
            row(sb, "resume", nz(r.targetRole), r.atsScore, r.createdAt.toString().substring(0, 10));
        for (FollowUpTask t : tasks.findByUserIdOrderByCreatedAtDesc(userId))
            row(sb, "followup_task", t.title, Boolean.TRUE.equals(t.done) ? "done" : "open", "");
        for (Map<String, Object> b : (List<Map<String, Object>>) d.get("badges"))
            row(sb, "badge", b.get("title"), Boolean.TRUE.equals(b.get("earned")) ? "earned" : "locked", b.get("description"));
        return sb.toString();
    }

    // ------------------------------------------------------------------

    /** Small layout helper over PDFBox: header band, cards, bars, tables, automatic page breaks and page numbers. */
    private static final class Pdf {
        static final int REG = 0, BOLD = 1;
        static final java.awt.Color GREEN = new java.awt.Color(0x06, 0x4C, 0x3B);
        static final java.awt.Color SAGE = new java.awt.Color(0xAA, 0xBF, 0x78);
        static final java.awt.Color LIGHT = new java.awt.Color(0xE8, 0xEE, 0xDC);
        static final java.awt.Color DARK = new java.awt.Color(0x20, 0x31, 0x2B);
        static final java.awt.Color MUTED = new java.awt.Color(0x5B, 0x65, 0x5F);
        static final java.awt.Color CORAL = new java.awt.Color(0xE9, 0x87, 0x7B);

        final PDDocument doc;
        final PDType1Font reg = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        final PDType1Font bold = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
        final float margin = 44, pageW = PDRectangle.A4.getWidth(), pageH = PDRectangle.A4.getHeight();
        final float x = margin, w = pageW - 2 * margin;
        float y;
        PDPageContentStream cs;
        int pages = 0;

        Pdf(PDDocument doc) throws IOException {
            this.doc = doc;
            newPage();
        }

        void newPage() throws IOException {
            if (cs != null) { footer(); cs.close(); }
            PDPage page = new PDPage(PDRectangle.A4);
            doc.addPage(page);
            pages++;
            cs = new PDPageContentStream(doc, page);
            y = pageH - margin;
        }

        void footer() throws IOException {
            text(x, 26, "Pathwise  |  AI Career Mentor Marketplace", REG, 8, MUTED);
            text(pageW - margin - 30, 26, "Page " + pages, REG, 8, MUTED);
        }

        void finish() throws IOException { footer(); cs.close(); }

        void need(float h) throws IOException { if (y - h < margin + 20) newPage(); }
        void advance(float h) { y -= h; }

        void rect(float rx, float ry, float rw, float rh, java.awt.Color c) throws IOException {
            cs.setNonStrokingColor(c);
            cs.addRect(rx, ry, rw, rh);
            cs.fill();
        }

        void text(float tx, float ty, String t, int style, float size, java.awt.Color c) throws IOException {
            cs.beginText();
            cs.setFont(style == BOLD ? bold : reg, size);
            cs.setNonStrokingColor(c);
            cs.newLineAtOffset(tx, ty);
            cs.showText(clean(t));
            cs.endText();
        }

        float width(String t, int style, float size) throws IOException {
            return (style == BOLD ? bold : reg).getStringWidth(clean(t)) / 1000 * size;
        }

        void header(String title, String sub) throws IOException {
            rect(0, pageH - 92, pageW, 92, GREEN);
            rect(0, pageH - 96, pageW, 4, SAGE);
            text(x, pageH - 48, title, BOLD, 22, java.awt.Color.WHITE);
            text(x, pageH - 70, sub, REG, 9.5f, LIGHT);
            y = pageH - 92 - 24;
        }

        /** Draws a light card whose top-left is at the current position; text is placed relative to (x, y). */
        void card(float h) throws IOException {
            need(h + 10);
            rect(x, y - h, w, h, LIGHT);
        }

        void bar(float bx, float by, float bw, float bh, double ratio) throws IOException {
            rect(bx, by, bw, bh, java.awt.Color.WHITE);
            double r = Math.max(0, Math.min(1, ratio));
            rect(bx, by, (float) (bw * r), bh, r >= 0.66 ? GREEN : r >= 0.33 ? SAGE : CORAL);
        }

        void section(String title) throws IOException {
            need(60);
            y -= 14;
            rect(x, y - 3, 4, 15, SAGE);
            text(x + 12, y, title, BOLD, 13, GREEN);
            y -= 20;
        }

        void kv(String k, String v) throws IOException {
            need(16);
            text(x, y, k, BOLD, 9.5f, MUTED);
            text(x + 110, y, v, REG, 10, DARK);
            y -= 15;
        }

        void labelBar(String label, String value, double ratio) throws IOException {
            need(22);
            text(x, y, label, REG, 9.5f, DARK);
            text(x + w - width(value, BOLD, 9.5f), y, value, BOLD, 9.5f, GREEN);
            bar(x, y - 10, w, 6, ratio);
            y -= 24;
        }

        void para(String t) throws IOException {
            for (String line : wrap(t, REG, 10, w)) { need(14); text(x, y, line, REG, 10, DARK); y -= 14; }
            y -= 4;
        }

        void bullet(String t) throws IOException {
            List<String> lines = wrap(t, REG, 10, w - 14);
            for (int i = 0; i < lines.size(); i++) {
                need(14);
                if (i == 0) rect(x + 2, y + 2.5f, 3.5f, 3.5f, SAGE);
                text(x + 14, y, lines.get(i), REG, 10, DARK);
                y -= 14;
            }
            y -= 2;
        }

        void tableHeader(String[] cols, float[] offs) throws IOException {
            need(22);
            rect(x, y - 5, w, 18, GREEN);
            for (int i = 0; i < cols.length; i++) text(x + 8 + offs[i], y, cols[i], BOLD, 9, java.awt.Color.WHITE);
            y -= 20;
        }

        void tableRow(String[] cells, float[] offs) throws IOException {
            need(18);
            for (int i = 0; i < cells.length; i++) text(x + 8 + offs[i], y, cells[i], REG, 9.5f, DARK);
            rect(x, y - 6, w, 0.5f, LIGHT);
            y -= 17;
        }

        List<String> wrap(String text, int style, float size, float width) throws IOException {
            List<String> out = new ArrayList<>();
            StringBuilder line = new StringBuilder();
            for (String word : clean(text).split(" ")) {
                String cand = line.length() == 0 ? word : line + " " + word;
                if (width(cand, style, size) > width && line.length() > 0) { out.add(line.toString()); line = new StringBuilder(word); }
                else line = new StringBuilder(cand);
            }
            out.add(line.toString());
            return out;
        }
    }

    /** Standard-14 fonts only cover Latin-1; replace anything else (such as the rupee sign). */
    private static String clean(String s) {
        StringBuilder sb = new StringBuilder();
        for (char c : s.toCharArray()) {
            if (c == '\u20B9') sb.append("Rs.");
            else if (c >= 32 && c <= 255) sb.append(c);
            else sb.append('?');
        }
        return new String(sb.toString().getBytes(StandardCharsets.ISO_8859_1), StandardCharsets.ISO_8859_1);
    }

    private static void row(StringBuilder sb, String section, Object item, Object value, Object detail) {
        sb.append(cell(section)).append(',').append(cell(item)).append(',').append(cell(value)).append(',').append(cell(detail)).append('\n');
    }

    private static String cell(Object o) {
        String s = o == null ? "" : o.toString();
        // neutralise spreadsheet formula injection
        if (!s.isEmpty() && "=+-@".indexOf(s.charAt(0)) >= 0 && !s.matches("-?\\d+(\\.\\d+)?")) s = "'" + s;
        return "\"" + s.replace("\"", "\"\"") + "\"";
    }

    private static String nz(String s) {
        return s == null ? "" : s;
    }
}
