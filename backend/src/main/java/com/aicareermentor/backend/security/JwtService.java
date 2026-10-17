package com.aicareermentor.backend.security;

import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;

/** Minimal HS256 JWT (no extra dependency). Claims: sub=userId, email, role, exp. */
@Service
public class JwtService {

    private static final Logger log = LoggerFactory.getLogger(JwtService.class);

    public record Claims(Long userId, String email, String role) {
    }

    @Value("${app.jwt.secret:}")
    private String configuredSecret;
    @Value("${app.jwt.ttl-hours:72}")
    private long ttlHours;

    private byte[] key;

    @PostConstruct
    void init() {
        if (configuredSecret == null || configuredSecret.length() < 16) {
            byte[] random = new byte[48];
            new SecureRandom().nextBytes(random);
            key = random;
            log.warn("JWT_SECRET not set (or shorter than 16 chars): using a random secret. "
                    + "All sessions end when the server restarts.");
        } else {
            key = configuredSecret.getBytes(StandardCharsets.UTF_8);
        }
    }

    public String issue(Long userId, String email, String role) {
        long exp = System.currentTimeMillis() / 1000 + ttlHours * 3600;
        String header = b64("{\"alg\":\"HS256\",\"typ\":\"JWT\"}");
        String payload = b64("{\"sub\":\"" + userId + "\",\"email\":\"" + esc(email)
                + "\",\"role\":\"" + esc(role) + "\",\"exp\":" + exp + "}");
        String signature = sign(header + "." + payload);
        return header + "." + payload + "." + signature;
    }

    /** Returns null if the token is malformed, tampered with or expired. */
    public Claims parse(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            byte[] expected = sign(parts[0] + "." + parts[1]).getBytes(StandardCharsets.UTF_8);
            if (!MessageDigest.isEqual(expected, parts[2].getBytes(StandardCharsets.UTF_8))) return null;

            String json = new String(Base64.getUrlDecoder().decode(parts[1]), StandardCharsets.UTF_8);
            long exp = Long.parseLong(field(json, "exp", true));
            if (exp < System.currentTimeMillis() / 1000) return null;
            return new Claims(Long.parseLong(field(json, "sub", false)),
                    field(json, "email", false), field(json, "role", false));
        } catch (RuntimeException e) {
            return null;
        }
    }

    // ---- helpers ----

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(key, "HmacSHA256"));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(mac.doFinal(data.getBytes(StandardCharsets.UTF_8)));
        } catch (Exception e) {
            throw new IllegalStateException("Could not sign token", e);
        }
    }

    private static String b64(String s) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(s.getBytes(StandardCharsets.UTF_8));
    }

    private static String esc(String s) {
        return s == null ? "" : s.replace("\\", "\\\\").replace("\"", "\\\"");
    }

    private static String field(String json, String name, boolean numeric) {
        String marker = "\"" + name + "\":";
        int i = json.indexOf(marker);
        if (i < 0) throw new IllegalArgumentException("missing " + name);
        int start = i + marker.length();
        if (numeric) {
            int end = start;
            while (end < json.length() && Character.isDigit(json.charAt(end))) end++;
            return json.substring(start, end);
        }
        int q1 = json.indexOf('"', start);
        int q2 = q1 + 1;
        StringBuilder sb = new StringBuilder();
        while (q2 < json.length() && json.charAt(q2) != '"') {
            if (json.charAt(q2) == '\\' && q2 + 1 < json.length()) q2++;
            sb.append(json.charAt(q2));
            q2++;
        }
        return sb.toString();
    }
}
