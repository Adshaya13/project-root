package com.smartcampus.config;

import com.smartcampus.security.OAuth2SuccessHandler;
import com.smartcampus.security.JwtAuthenticationFilter;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
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
        private final JwtAuthenticationFilter jwtAuthenticationFilter;

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
                                                // Public auth endpoints
                                                .requestMatchers("/login/**", "/oauth2/**").permitAll()
                                                .requestMatchers(HttpMethod.POST, "/api/auth/login",
                                                                "/api/auth/register")
                                                .permitAll()

                                                // Authenticated, including roleless users (used after first-time OAuth)
                                                .requestMatchers(HttpMethod.GET, "/api/auth/me").authenticated()
                                                .requestMatchers(HttpMethod.PUT, "/api/auth/role").authenticated()

                                                // Role-restricted APIs
                                                .requestMatchers(HttpMethod.GET, "/api/resources", "/api/resources/**")
                                                .hasAnyRole("USER", "TECHNICIAN", "ADMIN")
                                                .requestMatchers(HttpMethod.POST, "/api/resources").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PUT, "/api/resources/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.PATCH, "/api/resources/**").hasRole("ADMIN")
                                                .requestMatchers(HttpMethod.DELETE, "/api/resources/**")
                                                .hasRole("ADMIN")

                                                // Admin endpoints
                                                .requestMatchers("/api/admin/**").hasRole("ADMIN")

                                                // Any other API requires a real role
                                                .requestMatchers("/api/**").hasAnyRole("USER", "TECHNICIAN", "ADMIN")

                                                .anyRequest().permitAll())
                                .oauth2Login(oauth2 -> oauth2
                                                .successHandler(oAuth2SuccessHandler))
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

                return http.build();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
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
