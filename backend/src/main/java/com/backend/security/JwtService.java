package com.backend.security;

import com.backend.model.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Service
public class JwtService {

    private final SecretKey secretKey;
    private final long expirationMinutes;

    public JwtService(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-minutes}") long expirationMinutes
    ) {
        this.secretKey = createSecretKey(secret);
        this.expirationMinutes = expirationMinutes;
    }

    public String generateToken(User user) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("role", user.getRole().name());
        claims.put("name", user.getFullName());
        claims.put("emailVerified", user.isEmailVerified());
        claims.put("googleAccount", user.isGoogleAccount());

        Instant now = Instant.now();
        Instant expiresAt = now.plus(expirationMinutes, ChronoUnit.MINUTES);

        return Jwts.builder()
                .claims(claims)
                .subject(user.getEmail())
                .issuedAt(Date.from(now))
                .expiration(Date.from(expiresAt))
                .signWith(secretKey)
                .compact();
    }

    public Claims parseToken(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public String extractEmail(String token) {
        return parseToken(token).getSubject();
    }

    public Instant extractExpiration(String token) {
        return parseToken(token).getExpiration().toInstant();
    }

    private SecretKey createSecretKey(String secret) {
        byte[] bytes = secret.length() >= 32
                ? secret.getBytes(StandardCharsets.UTF_8)
                : Decoders.BASE64.decode("QUJDREVGR0hJSktMTU5PUFFSU1RVVldYWVo0NTY3ODkwQUJDREVGR0hJSg==");
        if (secret.length() >= 32) {
            return Keys.hmacShaKeyFor(bytes);
        }
        return Keys.hmacShaKeyFor(bytes);
    }
}