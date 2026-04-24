package com.community.community.config;

import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Order(1)
public class DatabaseSchemaMigration implements CommandLineRunner {

    private final JdbcTemplate jdbcTemplate;

    @Override
    public void run(String... args) {
        try {
            String dataType = jdbcTemplate.queryForObject(
                    "SELECT DATA_TYPE FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'role'",
                    String.class
            );

            if (dataType != null && !"varchar".equalsIgnoreCase(dataType) && !"char".equalsIgnoreCase(dataType)) {
                jdbcTemplate.execute("ALTER TABLE users MODIFY COLUMN role VARCHAR(50) NOT NULL");
                System.out.println("Migrated users.role column to VARCHAR(50)");
            }
        } catch (Exception ex) {
            System.out.println("Skipping users.role migration: " + ex.getMessage());
        }
    }
}