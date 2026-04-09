package com.smartcampus.config;

import com.smartcampus.security.OAuth2SuccessHandler;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

        private final OAuth2SuccessHandler oAuth2SuccessHandler;

        @Value("${app.cors-origins:http://localhost:5173}")
        private String corsOrigins;

        @Bean
        public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.IF_REQUIRED))
                                .authorizeHttpRequests(auth -> auth
                                                // Public endpoints
                                                .requestMatchers("/login/**", "/oauth2/**").permitAll()
                                                .requestMatchers("/api/auth/**").permitAll()
                                                // Resources: GET is public, mutating ops need ADMIN
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.GET,
                                                                "/api/resources", "/api/resources/**")
                                                .authenticated()
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.POST,
                                                                "/api/resources")
                                                .hasRole("ADMIN")
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.PUT,
                                                                "/api/resources/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.PATCH,
                                                                "/api/resources/**")
                                                .hasRole("ADMIN")
                                                .requestMatchers(
                                                                org.springframework.http.HttpMethod.DELETE,
                                                                "/api/resources/**")
                                                .hasRole("ADMIN")
                                                // Admin endpoints
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")
                                                // Everything else needs authentication
                                                .anyRequest().authenticated())
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2SuccessHandler));

                return http.build();
        }

        @Bean
        public CorsConfigurationSource corsConfigurationSource() {
                CorsConfiguration config = new CorsConfiguration();
                List<String> allowedOrigins = List.of(corsOrigins.split(","))
                                .stream()
                                .map(String::trim)
                                .filter(origin -> !origin.isBlank())
                                .toList();
                config.setAllowedOrigins(allowedOrigins);
                config.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
                config.setAllowedHeaders(List.of("*"));
                config.setAllowCredentials(true);
                config.setExposedHeaders(List.of("Authorization"));

                UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
                source.registerCorsConfiguration("/**", config);
                return source;
        }
}
