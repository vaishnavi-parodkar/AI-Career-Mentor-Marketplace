package com.aicareermentor.backend.security;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Requires a valid "Authorization: Bearer <jwt>" on /api/** except sign-up/login/password reset
 * and public read-only career data. Puts authUserId / authRole on the request.
 * Also blocks reading another user's data on the endpoints that carry the user id in the URL.
 */
@Component
public class AuthInterceptor implements HandlerInterceptor {

    public static final String USER_ID = "authUserId";
    public static final String ROLE = "authRole";

    private static final Pattern[] OWNED_PATHS = {
            Pattern.compile("^/api/profile/(\\d+)$"),
            Pattern.compile("^/api/careers/recommendations/(\\d+)$"),
            Pattern.compile("^/api/roadmaps/user/(\\d+)(/.*)?$"),
            Pattern.compile("^/api/skill-gap/(\\d+)/.*$"),
            Pattern.compile("^/api/skill-assessment/result/(\\d+)/.*$"),
    };

    private final JwtService jwtService;

    public AuthInterceptor(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler)
            throws Exception {

        String method = request.getMethod();
        String path = request.getRequestURI();

        if ("OPTIONS".equalsIgnoreCase(method)) return true;
        if (path.startsWith("/api/auth/")) return true;
        if ("GET".equalsIgnoreCase(method) && (path.equals("/api/careers") || path.matches("^/api/careers/[^/]+$"))
                && !path.startsWith("/api/careers/recommendations")) {
            return true;
        }
        if (!path.startsWith("/api/")) return true;

        String header = request.getHeader("Authorization");
        JwtService.Claims claims = (header != null && header.startsWith("Bearer "))
                ? jwtService.parse(header.substring(7).trim()) : null;

        if (claims == null) {
            return deny(response, 401, "Please log in again.");
        }

        String role = claims.role() == null ? "USER" : claims.role();
        request.setAttribute(USER_ID, claims.userId());
        request.setAttribute(ROLE, role);

        boolean admin = "ADMIN".equals(role);

        if (path.startsWith("/api/admin/") && !admin) {
            return deny(response, 403, "Administrator access required.");
        }
        // Mentor catalogue writes are admin-only
        if (path.startsWith("/api/mentors") && !"GET".equalsIgnoreCase(method) && !admin) {
            return deny(response, 403, "Administrator access required.");
        }

        if (!admin) {
            for (Pattern p : OWNED_PATHS) {
                Matcher m = p.matcher(path);
                if (m.matches() && !m.group(1).equals(String.valueOf(claims.userId()))) {
                    return deny(response, 403, "You can only access your own data.");
                }
            }
        }
        return true;
    }

    private boolean deny(HttpServletResponse response, int status, String message) throws Exception {
        response.setStatus(status);
        response.setContentType("application/json");
        response.getWriter().write("{\"success\":false,\"message\":\"" + message + "\"}");
        return false;
    }

    public static Long userId(HttpServletRequest request) {
        Object v = request.getAttribute(USER_ID);
        if (v == null) throw new IllegalArgumentException("Not signed in.");
        return (Long) v;
    }

    public static boolean isAdmin(HttpServletRequest request) {
        return "ADMIN".equals(request.getAttribute(ROLE));
    }
}
