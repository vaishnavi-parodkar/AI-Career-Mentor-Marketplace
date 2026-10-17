package com.aicareermentor.backend.ai;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import tools.jackson.databind.JsonNode;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

/**
 * Semantic similarity for mentor matching and mentor-knowledge retrieval.
 *
 * Order: Voxell Forge (turbo) -> Cohere embed -> local hashed bag-of-words.
 * The query and all documents are always embedded by the SAME provider (vectors from
 * different models can't be compared). Document vectors are cached per provider, so a
 * mentor is only re-embedded when their text changes.
 * Cohere rerank is available as an optional second stage.
 */
@Service
public class EmbeddingService {

    private static final Logger log = LoggerFactory.getLogger(EmbeddingService.class);
    private static final int LOCAL_DIM = 512;

    private final RestClient restClient = RestClient.builder().build();
    private final Map<String, float[]> cache = new ConcurrentHashMap<>();

    @Value("${ai.voxell.api-key:}") private String voxellKey;
    @Value("${ai.voxell.url:}") private String voxellUrl;
    @Value("${ai.voxell.model:turbo}") private String voxellModel;

    @Value("${ai.cohere.api-key:}") private String cohereKey;
    @Value("${ai.cohere.embed-model:embed-multilingual-light-v3.0}") private String cohereEmbedModel;
    @Value("${ai.cohere.rerank-model:rerank-v3.5}") private String cohereRerankModel;

    public record Scored(double[] scores, String provider) {
    }

    /** Cosine similarity (0..1) of the query against every document. */
    public Scored similarity(String query, List<String> docs) {
        if (docs.isEmpty()) return new Scored(new double[0], "none");

        List<String> texts = new ArrayList<>();
        texts.add(query);
        texts.addAll(docs);

        if (notBlank(voxellKey)) {
            try {
                return score("voxell", embedRemote("voxell", texts), docs.size());
            } catch (RuntimeException e) {
                log.warn("Voxell embeddings failed: {}", e.getMessage());
            }
        }
        if (notBlank(cohereKey)) {
            try {
                return score("cohere", embedRemote("cohere", texts), docs.size());
            } catch (RuntimeException e) {
                log.warn("Cohere embeddings failed: {}", e.getMessage());
            }
        }
        List<float[]> vectors = new ArrayList<>();
        for (String t : texts) vectors.add(localEmbed(t));
        return score("local", vectors, docs.size());
    }

    /** Optional Cohere rerank. Returns null if unavailable so the caller keeps its own order. */
    public double[] rerank(String query, List<String> docs) {
        if (!notBlank(cohereKey) || docs.isEmpty()) return null;
        try {
            Map<String, Object> body = new HashMap<>();
            body.put("model", cohereRerankModel);
            body.put("query", query);
            body.put("documents", docs);
            body.put("top_n", docs.size());

            JsonNode res = restClient.post()
                    .uri("https://api.cohere.com/v2/rerank")
                    .header(HttpHeaders.AUTHORIZATION, "Bearer " + cohereKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(JsonNode.class);

            double[] out = new double[docs.size()];
            if (res == null) return null;
            for (JsonNode r : res.path("results")) {
                int idx = r.path("index").asInt(-1);
                if (idx >= 0 && idx < out.length) out[idx] = r.path("relevance_score").asDouble(0);
            }
            return out;
        } catch (RuntimeException e) {
            log.warn("Cohere rerank failed: {}", e.getMessage());
            return null;
        }
    }

    // ------------------------------------------------------------------

    private Scored score(String provider, List<float[]> vectors, int docCount) {
        float[] q = vectors.get(0);
        double[] out = new double[docCount];
        for (int i = 0; i < docCount; i++) {
            out[i] = Math.max(0, cosine(q, vectors.get(i + 1)));
        }
        return new Scored(out, provider);
    }

    private List<float[]> embedRemote(String provider, List<String> texts) {
        // First text is the query (never cached); the rest are documents (cached).
        float[][] result = new float[texts.size()][];
        List<Integer> missing = new ArrayList<>();
        for (int i = 0; i < texts.size(); i++) {
            if (i > 0) {
                float[] hit = cache.get(provider + "|" + sha(texts.get(i)));
                if (hit != null) {
                    result[i] = hit;
                    continue;
                }
            }
            missing.add(i);
        }

        if (!missing.isEmpty()) {
            List<String> batch = new ArrayList<>();
            for (int idx : missing) batch.add(clip(texts.get(idx)));
            // Keep every call small: embed in chunks of 64
            for (int from = 0; from < batch.size(); from += 64) {
                int to = Math.min(batch.size(), from + 64);
                List<String> chunk = batch.subList(from, to);
                // the query is always index 0 of the first chunk
                boolean firstChunk = from == 0;
                List<float[]> vectors = "voxell".equals(provider)
                        ? callVoxell(chunk)
                        : callCohere(chunk, firstChunk ? 1 : 0);
                for (int k = 0; k < vectors.size(); k++) {
                    int originalIndex = missing.get(from + k);
                    result[originalIndex] = vectors.get(k);
                    if (originalIndex > 0) {
                        cache.put(provider + "|" + sha(texts.get(originalIndex)), vectors.get(k));
                    }
                }
            }
        }
        return Arrays.asList(result);
    }

    private List<float[]> callVoxell(List<String> inputs) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", voxellModel);
        body.put("input", inputs);
        JsonNode res = restClient.post()
                .uri(voxellUrl)
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + voxellKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        List<float[]> out = new ArrayList<>();
        if (res == null) throw new IllegalStateException("empty");
        for (JsonNode item : res.path("data")) out.add(toVector(item.path("embedding")));
        if (out.size() != inputs.size()) throw new IllegalStateException("size mismatch");
        return out;
    }

    /** Cohere v2 embed: input_type differs for queries and documents, so two calls when needed. */
    private List<float[]> callCohere(List<String> inputs, int queryCount) {
        List<float[]> out = new ArrayList<>();
        if (queryCount > 0) {
            out.addAll(cohereEmbed(inputs.subList(0, queryCount), "search_query"));
        }
        if (inputs.size() > queryCount) {
            out.addAll(cohereEmbed(inputs.subList(queryCount, inputs.size()), "search_document"));
        }
        return out;
    }

    private List<float[]> cohereEmbed(List<String> texts, String inputType) {
        Map<String, Object> body = new HashMap<>();
        body.put("model", cohereEmbedModel);
        body.put("texts", texts);
        body.put("input_type", inputType);
        body.put("embedding_types", List.of("float"));
        JsonNode res = restClient.post()
                .uri("https://api.cohere.com/v2/embed")
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + cohereKey)
                .contentType(MediaType.APPLICATION_JSON)
                .body(body)
                .retrieve()
                .body(JsonNode.class);
        List<float[]> out = new ArrayList<>();
        if (res == null) throw new IllegalStateException("empty");
        for (JsonNode v : res.path("embeddings").path("float")) out.add(toVector(v));
        if (out.size() != texts.size()) throw new IllegalStateException("size mismatch");
        return out;
    }

    private static float[] toVector(JsonNode node) {
        float[] v = new float[node.size()];
        for (int i = 0; i < v.length; i++) v[i] = (float) node.get(i).asDouble();
        return v;
    }

    // ---------- local fallback: hashed unigrams + bigrams ----------

    private static final Set<String> STOP = Set.of("the", "a", "an", "and", "or", "to", "of", "in", "for", "on",
            "with", "i", "my", "me", "is", "are", "want", "be", "as", "at", "by", "it", "this", "that", "from");

    static float[] localEmbed(String text) {
        float[] v = new float[LOCAL_DIM];
        String[] tokens = text.toLowerCase().replaceAll("[^a-z0-9+#. ]", " ").split("\\s+");
        String prev = null;
        for (String raw : tokens) {
            if (raw.isBlank() || STOP.contains(raw)) continue;
            String t = stem(raw);
            v[Math.floorMod(t.hashCode(), LOCAL_DIM)] += 1f;
            if (prev != null) v[Math.floorMod((prev + "_" + t).hashCode(), LOCAL_DIM)] += 0.6f;
            prev = t;
        }
        return v;
    }

    private static String stem(String w) {
        if (w.length() > 5 && w.endsWith("ing")) return w.substring(0, w.length() - 3);
        if (w.length() > 4 && w.endsWith("es")) return w.substring(0, w.length() - 2);
        if (w.length() > 3 && w.endsWith("s")) return w.substring(0, w.length() - 1);
        return w;
    }

    static double cosine(float[] a, float[] b) {
        int n = Math.min(a.length, b.length);
        double dot = 0, na = 0, nb = 0;
        for (int i = 0; i < n; i++) {
            dot += a[i] * b[i];
            na += a[i] * a[i];
            nb += b[i] * b[i];
        }
        return (na == 0 || nb == 0) ? 0 : dot / (Math.sqrt(na) * Math.sqrt(nb));
    }

    private static String clip(String s) {
        return s.length() > 2000 ? s.substring(0, 2000) : s;
    }

    private static boolean notBlank(String s) {
        return s != null && !s.isBlank();
    }

    private static String sha(String text) {
        try {
            byte[] d = MessageDigest.getInstance("SHA-1").digest(text.getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : d) sb.append(String.format("%02x", b));
            return sb.toString();
        } catch (Exception e) {
            return Integer.toString(text.hashCode());
        }
    }
}
