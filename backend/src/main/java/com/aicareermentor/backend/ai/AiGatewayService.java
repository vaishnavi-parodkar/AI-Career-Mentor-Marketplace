package com.aicareermentor.backend.ai;

import com.aicareermentor.backend.entity.AiUsageLog;
import com.aicareermentor.backend.repository.AiUsageLogRepository;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import tools.jackson.databind.JsonNode;
import tools.jackson.databind.ObjectMapper;

import java.net.http.HttpClient;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Duration;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Single entry point for every LLM call in the app.
 *
 * Order (configurable with ai.chat.order): Gemini -> UnoRouter -> Hugging Face -> Cohere -> Groq.
 * - providers without a key/model are skipped
 * - 429  : provider is put on cooldown (Retry-After or 60s) and the next provider is tried
 * - 401/403 : provider is disabled for 10 minutes (bad key), next provider is tried
 * - 5xx / timeout : one retry with backoff, then next provider
 * - 400 with json_schema : retried once on the same provider with plain json_object mode
 * - identical cacheable requests are answered from a small in-memory cache
 * - every attempt is recorded in ai_usage_logs for the admin dashboard
 */
@Service
public class AiGatewayService {

    private static final Logger log = LoggerFactory.getLogger(AiGatewayService.class);

    public record ChatProvider(String name, String url, String apiKey, String model,
                               String tokenParam, boolean jsonSchema) {
    }

    private record CacheEntry(AiResponse response, long expiresAt) {
    }

    private final ObjectMapper objectMapper;
    private final AiUsageLogRepository usageRepository;
    private final RestClient restClient;

    private final Map<String, Long> cooldownUntil = new ConcurrentHashMap<>();
    private final Map<String, CacheEntry> cache = new ConcurrentHashMap<>();
    private final Map<String, long[]> counters = new ConcurrentHashMap<>(); // [success, failure]
    private final Map<String, String> lastError = new ConcurrentHashMap<>();
    private final List<ChatProvider> providers = new ArrayList<>();

    @Value("${ai.chat.order:gemini,unorouter,huggingface,cohere,groq}")
    private String order;
    @Value("${ai.timeout-seconds:40}")
    private int timeoutSeconds;

    @Value("${ai.gemini.api-key:}") private String geminiKey;
    @Value("${ai.gemini.url:}") private String geminiUrl;
    @Value("${ai.gemini.model:}") private String geminiModel;

    @Value("${ai.unorouter.api-key:}") private String unoKey;
    @Value("${ai.unorouter.url:}") private String unoUrl;
    @Value("${ai.unorouter.model:}") private String unoModel;

    @Value("${ai.huggingface.api-key:}") private String hfKey;
    @Value("${ai.huggingface.url:}") private String hfUrl;
    @Value("${ai.huggingface.model:}") private String hfModel;

    @Value("${ai.cohere.api-key:}") private String cohereKey;
    @Value("${ai.cohere.url:}") private String cohereUrl;
    @Value("${ai.cohere.model:}") private String cohereModel;

    @Value("${groq.api.key:}") private String groqKey;
    @Value("${groq.api.url:}") private String groqUrl;
    @Value("${groq.model:}") private String groqModel;

    public AiGatewayService(ObjectMapper objectMapper, AiUsageLogRepository usageRepository) {
        this.objectMapper = objectMapper;
        this.usageRepository = usageRepository;
        HttpClient httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(8))
                .build();
        JdkClientHttpRequestFactory factory = new JdkClientHttpRequestFactory(httpClient);
        factory.setReadTimeout(Duration.ofSeconds(60));
        this.restClient = RestClient.builder().requestFactory(factory).build();
    }

    @PostConstruct
    void init() {
        Map<String, ChatProvider> all = new LinkedHashMap<>();
        all.put("gemini", new ChatProvider("gemini", geminiUrl, geminiKey, geminiModel, "max_tokens", true));
        all.put("unorouter", new ChatProvider("unorouter", unoUrl, unoKey, unoModel, "max_tokens", false));
        all.put("huggingface", new ChatProvider("huggingface", hfUrl, hfKey, hfModel, "max_tokens", false));
        all.put("cohere", new ChatProvider("cohere", cohereUrl, cohereKey, cohereModel, "max_tokens", false));
        all.put("groq", new ChatProvider("groq", groqUrl, groqKey, groqModel, "max_completion_tokens", true));

        for (String name : order.split(",")) {
            ChatProvider p = all.get(name.trim().toLowerCase());
            if (p != null && notBlank(p.apiKey()) && notBlank(p.model()) && notBlank(p.url())) {
                providers.add(p);
            }
        }
        log.info("AI providers active (in order): {}",
                providers.stream().map(ChatProvider::name).toList());
        if (providers.isEmpty()) {
            log.warn("No AI provider is configured. AI features will use their offline fallbacks.");
        }
    }

    // ------------------------------------------------------------------
    // Public API
    // ------------------------------------------------------------------

    public boolean isAvailable() {
        return !providers.isEmpty();
    }

    public AiResponse chat(AiRequest request) {

        String cacheKey = null;
        if (request.cacheSeconds() > 0) {
            cacheKey = sha(request.feature() + "|" + request.system() + "|" + request.user()
                    + "|" + request.history());
            CacheEntry hit = cache.get(cacheKey);
            if (hit != null && hit.expiresAt() > System.currentTimeMillis()) {
                AiResponse r = hit.response();
                return new AiResponse(r.content(), r.provider(), r.model(), 0, true);
            }
        }

        if (providers.isEmpty()) {
            throw new AiUnavailableException("No AI provider is configured.");
        }

        List<String> problems = new ArrayList<>();
        long now = System.currentTimeMillis();

        for (ChatProvider provider : providers) {

            Long until = cooldownUntil.get(provider.name());
            if (until != null && until > now) {
                problems.add(provider.name() + ": cooling down");
                continue;
            }

            boolean schemaMode = request.responseFormat() != null
                    && "json_schema".equals(request.responseFormat().get("type"))
                    && provider.jsonSchema();
            boolean retriedSchema = false;

            for (int attempt = 0; attempt < 2; attempt++) {

                long started = System.currentTimeMillis();

                try {
                    String content = call(provider, request, schemaMode);

                    if (request.responseFormat() != null) {
                        content = stripFences(content);
                        objectMapper.readTree(content); // must be valid JSON
                    }

                    long took = System.currentTimeMillis() - started;
                    record(provider.name(), request.feature(), true, took, null);
                    AiResponse response = new AiResponse(content, provider.name(), provider.model(), took, false);

                    if (cacheKey != null) {
                        cache.put(cacheKey, new CacheEntry(response,
                                System.currentTimeMillis() + request.cacheSeconds() * 1000L));
                        if (cache.size() > 500) {
                            cache.entrySet().removeIf(e -> e.getValue().expiresAt() < System.currentTimeMillis());
                        }
                    }
                    return response;

                } catch (RestClientResponseException e) {

                    long took = System.currentTimeMillis() - started;
                    int status = e.getStatusCode().value();
                    record(provider.name(), request.feature(), false, took, "HTTP " + status);
                    problems.add(provider.name() + ": HTTP " + status);

                    if (status == 429) {
                        cooldownUntil.put(provider.name(), System.currentTimeMillis() + retryAfterMillis(e));
                        break;
                    }
                    if (status == 401 || status == 403) {
                        cooldownUntil.put(provider.name(), System.currentTimeMillis() + 10 * 60_000L);
                        break;
                    }
                    if (status == 400 || status == 422) {
                        if (schemaMode && !retriedSchema) {
                            schemaMode = false;
                            retriedSchema = true;
                            attempt--;
                            continue;
                        }
                        break; // this provider rejects the request: move on
                    }
                    if (status >= 500) {
                        sleep(400L * (attempt + 1));
                        continue;
                    }
                    break;

                } catch (RuntimeException e) {
                    // timeouts, connection problems, unparsable JSON
                    long took = System.currentTimeMillis() - started;
                    record(provider.name(), request.feature(), false, took, e.getClass().getSimpleName());
                    problems.add(provider.name() + ": " + e.getClass().getSimpleName());
                    sleep(400L * (attempt + 1));
                }
            }
        }

        throw new AiUnavailableException("All AI providers failed: " + String.join("; ", problems));
    }

    /**
     * Adapter for the older services that build an OpenAI-style request body by hand
     * (messages / temperature / max_completion_tokens / response_format). Returns the reply text.
     */
    @SuppressWarnings("unchecked")
    public String chatFromOpenAiBody(String feature, Map<String, Object> body) {
        List<Map<String, Object>> messages = (List<Map<String, Object>>) body.get("messages");
        String system = "";
        String user = "";
        List<Map<String, String>> history = new ArrayList<>();
        for (int i = 0; i < messages.size(); i++) {
            Map<String, Object> m = messages.get(i);
            String role = String.valueOf(m.get("role"));
            String content = String.valueOf(m.get("content"));
            if ("system".equals(role) && system.isEmpty()) system = content;
            else if (i == messages.size() - 1) user = content;
            else history.add(Map.of("role", role, "content", content));
        }
        double temperature = body.get("temperature") instanceof Number n ? n.doubleValue() : 0.4;
        Object maxTokens = body.containsKey("max_completion_tokens") ? body.get("max_completion_tokens") : body.get("max_tokens");
        int max = maxTokens instanceof Number n ? n.intValue() : 1500;
        Map<String, Object> format = (Map<String, Object>) body.get("response_format");
        return chat(new AiRequest(feature, system, user, temperature, max, format, history, 0)).content();
    }

    /** Parses a json-mode reply into a tree. */
    public JsonNode chatJson(AiRequest request) {
        AiResponse response = chat(request);
        return objectMapper.readTree(stripFences(response.content()));
    }

    public List<Map<String, Object>> providerStatus() {
        List<Map<String, Object>> out = new ArrayList<>();
        long now = System.currentTimeMillis();
        for (ChatProvider p : providers) {
            long[] c = counters.getOrDefault(p.name(), new long[]{0, 0});
            Long until = cooldownUntil.get(p.name());
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", p.name());
            m.put("model", p.model());
            m.put("successes", c[0]);
            m.put("failures", c[1]);
            m.put("coolingDown", until != null && until > now);
            m.put("lastError", lastError.get(p.name()));
            out.add(m);
        }
        return out;
    }

    // ------------------------------------------------------------------
    // Internals
    // ------------------------------------------------------------------

    private String call(ChatProvider provider, AiRequest request, boolean schemaMode) {

        boolean jsonMode = request.responseFormat() != null;
        String system = request.system() == null ? "" : request.system();
        if (jsonMode && !schemaMode) {
            system = system + "\nReturn ONLY one valid JSON object. No markdown, no commentary.";
            Object js = request.responseFormat().get("json_schema");
            if (js instanceof Map<?, ?> jm && jm.get("schema") != null) {
                // the provider can't enforce the schema, so put it in the prompt
                system = system + "\nThe JSON must follow exactly this JSON Schema: " + objectMapper.writeValueAsString(jm.get("schema"));
            }
        }

        List<Map<String, String>> messages = new ArrayList<>();
        if (!system.isBlank()) {
            messages.add(Map.of("role", "system", "content", system));
        }
        if (request.history() != null) {
            for (Map<String, String> turn : request.history()) {
                String role = "assistant".equals(turn.get("role")) ? "assistant" : "user";
                String text = turn.get("content");
                if (text != null && !text.isBlank()) {
                    messages.add(Map.of("role", role, "content", text));
                }
            }
        }
        messages.add(Map.of("role", "user", "content", request.user()));

        Map<String, Object> body = new HashMap<>();
        body.put("model", provider.model());
        body.put("messages", messages);
        body.put("temperature", request.temperature());
        body.put(provider.tokenParam(), request.maxTokens());

        if (jsonMode) {
            body.put("response_format", schemaMode
                    ? request.responseFormat()
                    : Map.of("type", "json_object"));
        }

        JsonNode response = restClient.post()
                .uri(provider.url())
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + provider.apiKey())
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);

        if (response == null) {
            throw new IllegalStateException("Empty response");
        }
        JsonNode content = response.path("choices").path(0).path("message").path("content");
        if (content.isMissingNode() || content.isNull() || content.asText().isBlank()) {
            throw new IllegalStateException("No content");
        }
        return content.asText();
    }

    private void record(String provider, String feature, boolean ok, long ms, String error) {
        long[] c = counters.computeIfAbsent(provider, k -> new long[]{0, 0});
        synchronized (c) {
            if (ok) c[0]++; else c[1]++;
        }
        if (!ok) {
            lastError.put(provider, error);
        }
        try {
            usageRepository.save(new AiUsageLog(provider, feature, ok, ms, error));
        } catch (RuntimeException e) {
            log.debug("Could not store AI usage log: {}", e.getMessage());
        }
    }

    private long retryAfterMillis(RestClientResponseException e) {
        try {
            String header = e.getResponseHeaders() == null ? null : e.getResponseHeaders().getFirst("Retry-After");
            if (header != null) {
                return Math.max(5, Math.min(900, Long.parseLong(header.trim()))) * 1000L;
            }
        } catch (RuntimeException ignored) {
            // fall through
        }
        return 60_000L;
    }

    private static String stripFences(String text) {
        String t = text == null ? "" : text.trim();
        if (t.startsWith("```")) {
            int firstNewline = t.indexOf('\n');
            if (firstNewline > 0) t = t.substring(firstNewline + 1);
            if (t.endsWith("```")) t = t.substring(0, t.length() - 3);
        }
        return t.trim();
    }

    private static void sleep(long ms) {
        try {
            Thread.sleep(ms);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String sha(String text) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : digest) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return Integer.toString(text.hashCode());
        }
    }
}
