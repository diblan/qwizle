package com.qwizle.api.auth;

import java.time.OffsetDateTime;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DemoUserSeeder implements ApplicationRunner {
    private final JdbcClient jdbcClient;
    private final PasswordEncoder passwordEncoder;
    private final String email;
    private final String password;
    private final String displayName;

    public DemoUserSeeder(
            JdbcClient jdbcClient,
            PasswordEncoder passwordEncoder,
            @Value("${qwizle.demo-user.email}") String email,
            @Value("${qwizle.demo-user.password}") String password,
            @Value("${qwizle.demo-user.display-name}") String displayName) {
        this.jdbcClient = jdbcClient;
        this.passwordEncoder = passwordEncoder;
        this.email = email;
        this.password = password;
        this.displayName = displayName;
    }

    @Override
    public void run(ApplicationArguments args) {
        Long existing = jdbcClient.sql("SELECT COUNT(*) FROM users WHERE email = :email")
                .param("email", email)
                .query(Long.class)
                .single();
        if (existing > 0) {
            return;
        }

        OffsetDateTime now = OffsetDateTime.now();
        jdbcClient.sql("""
                INSERT INTO users (email, display_name, password_hash, created_at, updated_at)
                VALUES (:email, :displayName, :passwordHash, :createdAt, :updatedAt)
                """)
                .param("email", email)
                .param("displayName", displayName)
                .param("passwordHash", passwordEncoder.encode(password))
                .param("createdAt", now)
                .param("updatedAt", now)
                .update();
    }
}
