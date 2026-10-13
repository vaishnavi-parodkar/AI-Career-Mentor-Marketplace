package com.aicareermentor.backend.config;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;

/**
 * Profiles can now be saved in parts (half profile first, completed later), so the
 * columns that used to be NOT NULL must accept NULL. Hibernate's ddl-auto=update never
 * relaxes an existing constraint, so databases created before this change are altered
 * here. Safe to run on every start: MODIFY to the same definition is a no-op.
 */
@Configuration
public class ProfileSchemaMigration {

    private static final Logger log = LoggerFactory.getLogger(ProfileSchemaMigration.class);

    @Bean
    @Order(0)
    CommandLineRunner relaxProfileColumns(JdbcTemplate jdbc) {
        return args -> {
            String[] statements = {
                    "ALTER TABLE profiles MODIFY qualification varchar(100) NULL",
                    "ALTER TABLE profiles MODIFY field varchar(150) NULL",
                    "ALTER TABLE profiles MODIFY grad_year int NULL",
                    "ALTER TABLE profiles MODIFY interests varchar(500) NULL",
                    "ALTER TABLE profiles MODIFY goal varchar(500) NULL"
            };
            for (String sql : statements) {
                try {
                    jdbc.execute(sql);
                } catch (Exception e) {
                    log.warn("Profile schema step skipped ({}): {}", sql, e.getMessage());
                }
            }
        };
    }
}
