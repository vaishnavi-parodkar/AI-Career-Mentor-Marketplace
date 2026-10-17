package com.aicareermentor.backend.service;

import com.aicareermentor.backend.entity.Notification;
import com.aicareermentor.backend.repository.NotificationRepository;
import com.aicareermentor.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.List;
import java.util.Map;
import java.util.concurrent.CompletableFuture;

/** In-app notifications, plus optional email through Resend when RESEND_API_KEY is set. */
@Service
public class NotificationService {

    private static final Logger log = LoggerFactory.getLogger(NotificationService.class);

    private final NotificationRepository repository;
    private final UserRepository userRepository;
    private final RestClient restClient = RestClient.builder().build();

    @Value("${resend.api-key:}") private String resendKey;
    @Value("${resend.from:Pathwise <onboarding@resend.dev>}") private String resendFrom;

    public NotificationService(NotificationRepository repository, UserRepository userRepository) {
        this.repository = repository;
        this.userRepository = userRepository;
    }

    public Notification create(Long userId, String type, String title, String message, String link) {
        Notification n = new Notification();
        n.userId = userId;
        n.type = type;
        n.title = title;
        n.message = message == null ? null : message.substring(0, Math.min(580, message.length()));
        n.link = link;
        return repository.save(n);
    }

    /** In-app notification plus an email (if email is configured). Never throws. */
    public void createWithEmail(Long userId, String type, String title, String message, String link) {
        try {
            create(userId, type, title, message, link);
        } catch (RuntimeException e) {
            log.warn("Could not store notification: {}", e.getMessage());
        }
        if (resendKey == null || resendKey.isBlank()) return;
        userRepository.findById(userId).ifPresent(user -> CompletableFuture.runAsync(() -> {
            try {
                restClient.post()
                        .uri("https://api.resend.com/emails")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer " + resendKey)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(Map.of("from", resendFrom, "to", List.of(user.getEmail()),
                                "subject", title, "text", message == null ? title : message))
                        .retrieve()
                        .toBodilessEntity();
            } catch (RuntimeException e) {
                log.warn("Resend email failed: {}", e.getMessage());
            }
        }));
    }

    public List<Notification> list(Long userId) {
        return repository.findTop50ByUserIdOrderByCreatedAtDesc(userId);
    }

    public long unread(Long userId) {
        return repository.countByUserIdAndReadFalse(userId);
    }

    public void markAllRead(Long userId) {
        List<Notification> unread = repository.findByUserIdAndReadFalse(userId);
        unread.forEach(n -> n.read = true);
        repository.saveAll(unread);
    }

    public void markRead(Long userId, Long id) {
        repository.findById(id).ifPresent(n -> {
            if (userId.equals(n.userId)) {
                n.read = true;
                repository.save(n);
            }
        });
    }
}
