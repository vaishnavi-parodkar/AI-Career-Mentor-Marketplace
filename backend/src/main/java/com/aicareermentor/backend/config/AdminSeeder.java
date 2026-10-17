package com.aicareermentor.backend.config;

import com.aicareermentor.backend.entity.User;
import com.aicareermentor.backend.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

/** Creates (or promotes) the administrator named in ADMIN_EMAIL / ADMIN_PASSWORD. */
@Configuration
public class AdminSeeder {

    private static final Logger log = LoggerFactory.getLogger(AdminSeeder.class);

    @Bean
    @Order(2)
    CommandLineRunner seedAdmin(UserRepository users, PasswordEncoder encoder,
                                @Value("${app.admin.email:}") String email,
                                @Value("${app.admin.password:}") String password,
                                @Value("${app.admin.name:Administrator}") String name) {
        return args -> {
            if (email == null || email.isBlank()) {
                return;
            }
            String normalized = email.trim().toLowerCase();
            User user = users.findByEmail(normalized).orElse(null);
            if (user == null) {
                if (password == null || password.length() < 8) {
                    log.warn("ADMIN_EMAIL is set but ADMIN_PASSWORD is missing or shorter than 8 characters.");
                    return;
                }
                user = new User(name, normalized, encoder.encode(password));
                log.info("Created administrator account {}", normalized);
            }
            user.setRole("ADMIN");
            users.save(user);
        };
    }
}
