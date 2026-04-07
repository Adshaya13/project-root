package com.backend.service;

import com.backend.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;

@Service
public class GoogleIdentityService {

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(10);
    private static final String TOKEN_INFO_ENDPOINT = "https://oauth2.googleapis.com/tokeninfo?access_token=";
    private static final URI USER_INFO_URI = URI.create("https://www.googleapis.com/oauth2/v3/userinfo");

    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;
    private final String expectedClientId;

    public GoogleIdentityService(
            ObjectMapper objectMapper,
            @Value("${app.google.client-id:}") String expectedClientId
    ) {
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(REQUEST_TIMEOUT)
                .build();
        this.objectMapper = objectMapper;
        this.expectedClientId = expectedClientId == null ? "" : expectedClientId.trim();
    }

    public GoogleIdentity verifyAccessToken(String accessToken) {
        if (expectedClientId.isEmpty()) {
            throw new ApiException(HttpStatus.INTERNAL_SERVER_ERROR, "Google authentication is not configured");
        }
        if (accessToken == null || accessToken.isBlank()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Google access token is required");
        }

        TokenInfo tokenInfo = fetchTokenInfo(accessToken.trim());
        if (!expectedClientId.equals(tokenInfo.audience())) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google token audience is invalid");
        }

        UserInfo userInfo = fetchUserInfo(accessToken.trim());
        if (!userInfo.emailVerified()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google account email is not verified");
        }

        return new GoogleIdentity(userInfo.email(), userInfo.name(), userInfo.subject());
    }

    private TokenInfo fetchTokenInfo(String accessToken) {
        String encodedToken = URLEncoder.encode(accessToken, StandardCharsets.UTF_8);
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(TOKEN_INFO_ENDPOINT + encodedToken))
                .timeout(REQUEST_TIMEOUT)
                .GET()
                .build();

        JsonNode payload = execute(request, HttpStatus.UNAUTHORIZED, "Invalid Google access token");
        String audience = text(payload, "aud");
        if (audience.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google token audience is missing");
        }

        return new TokenInfo(audience);
    }

    private UserInfo fetchUserInfo(String accessToken) {
        HttpRequest request = HttpRequest.newBuilder()
                .uri(USER_INFO_URI)
                .timeout(REQUEST_TIMEOUT)
                .header("Authorization", "Bearer " + accessToken)
                .GET()
                .build();

        JsonNode payload = execute(request, HttpStatus.UNAUTHORIZED, "Unable to fetch Google profile");
        String email = text(payload, "email").toLowerCase();
        String name = text(payload, "name");
        String subject = text(payload, "sub");

        if (email.isBlank() || name.isBlank() || subject.isBlank()) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Google profile is incomplete");
        }

        return new UserInfo(email, name, subject, bool(payload, "email_verified"));
    }

    private JsonNode execute(HttpRequest request, HttpStatus status, String message) {
        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ApiException(status, message);
            }
            return objectMapper.readTree(response.body());
        } catch (IOException exception) {
            throw new ApiException(HttpStatus.BAD_GATEWAY, "Unable to validate Google token right now");
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw new ApiException(HttpStatus.SERVICE_UNAVAILABLE, "Google validation was interrupted");
        }
    }

    private String text(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value == null ? "" : value.asText("").trim();
    }

    private boolean bool(JsonNode node, String field) {
        JsonNode value = node.get(field);
        return value != null && value.asBoolean(false);
    }

    public record GoogleIdentity(String email, String name, String subject) {
    }

    private record TokenInfo(String audience) {
    }

    private record UserInfo(String email, String name, String subject, boolean emailVerified) {
    }
}
