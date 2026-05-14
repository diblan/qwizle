package com.qwizle.api.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.Clock;
import java.time.OffsetDateTime;
import java.util.HexFormat;
import java.util.Optional;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AuthService {
    private final JdbcClient jdbcClient;
    private final PasswordEncoder passwordEncoder;
    private final Clock clock;

    public AuthService(JdbcClient jdbcClient, PasswordEncoder passwordEncoder, Clock clock) {
        this.jdbcClient = jdbcClient;
        this.passwordEncoder = passwordEncoder;
        this.clock = clock;
    }

    public LoginResponse login(LoginRequest request) {
        StoredUser user = findStoredUser(request.email().trim().toLowerCase())
                .orElseThrow(() -> invalidCredentials());

        if (!passwordEncoder.matches(request.password(), user.passwordHash())) {
            throw invalidCredentials();
        }

        String token = UUID.randomUUID() + "." + UUID.randomUUID();
        OffsetDateTime now = OffsetDateTime.now(clock);
        jdbcClient.sql("""
                INSERT INTO user_sessions (user_id, token_hash, created_at, expires_at)
                VALUES (:userId, :tokenHash, :createdAt, :expiresAt)
                """)
                .param("userId", user.id())
                .param("tokenHash", sha256(token))
                .param("createdAt", now)
                .param("expiresAt", now.plusDays(30))
                .update();

        return new LoginResponse(token, user.profile());
    }

    public UserProfile currentUser(String authorizationHeader) {
        String token = bearerToken(authorizationHeader)
                .orElseThrow(() -> unauthorized("Missing bearer token."));

        return jdbcClient.sql("""
                SELECT u.id, u.email, u.display_name
                FROM users u
                JOIN user_sessions s ON s.user_id = u.id
                WHERE s.token_hash = :tokenHash
                  AND s.expires_at > :now
                """)
                .param("tokenHash", sha256(token))
                .param("now", OffsetDateTime.now(clock))
                .query((rs, rowNum) -> new UserProfile(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("display_name")))
                .optional()
                .orElseThrow(() -> unauthorized("Invalid or expired bearer token."));
    }

    private Optional<StoredUser> findStoredUser(String email) {
        return jdbcClient.sql("""
                SELECT id, email, display_name, password_hash
                FROM users
                WHERE email = :email
                """)
                .param("email", email)
                .query((rs, rowNum) -> new StoredUser(
                        rs.getLong("id"),
                        rs.getString("email"),
                        rs.getString("display_name"),
                        rs.getString("password_hash")))
                .optional();
    }

    private Optional<String> bearerToken(String authorizationHeader) {
        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return Optional.empty();
        }
        String token = authorizationHeader.substring("Bearer ".length()).trim();
        return token.isBlank() ? Optional.empty() : Optional.of(token);
    }

    private ResponseStatusException invalidCredentials() {
        return unauthorized("Invalid email or password.");
    }

    private ResponseStatusException unauthorized(String message) {
        return new ResponseStatusException(HttpStatus.UNAUTHORIZED, message);
    }

    private String sha256(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is required by the Java platform.", ex);
        }
    }

    private record StoredUser(Long id, String email, String displayName, String passwordHash) {
        UserProfile profile() {
            return new UserProfile(id, email, displayName);
        }
    }
}
