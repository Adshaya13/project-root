package com.smartcampus.security;

import com.smartcampus.model.User;
import com.smartcampus.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.util.Optional;

@Slf4j
@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;

    @Value("${app.oauth2.redirect-uri}")
    private String redirectUri;

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication) throws IOException {

        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();

        String email = oAuth2User.getAttribute("email");
        String name = oAuth2User.getAttribute("name");
        String picture = oAuth2User.getAttribute("picture");
        String googleId = oAuth2User.getAttribute("sub");

        log.info("OAuth2 login success for: {}", email);

        // Save or update user in database
        Optional<User> existingUser = userRepository.findByEmail(email);
        User user;
        boolean isNewUser;

        if (existingUser.isPresent()) {
            user = existingUser.get();
            user.setName(name);
            user.setAvatarUrl(picture);
            isNewUser = false;
        } else {
            user = User.builder()
                    .email(email)
                    .name(name)
                    .avatarUrl(picture)
                    .googleId(googleId)
                    .role(User.Role.USER) // default role
                    .build();
            isNewUser = true;
        }

        userRepository.save(user);

        // Generate JWT token
        String token = jwtTokenProvider.generateToken(email, user.getRole().name());

        // Redirect to frontend with token and isNewUser flag
        String targetUrl = redirectUri
                + "?token=" + token
                + "&isNewUser=" + isNewUser
                + "&role=" + user.getRole().name();

        log.info("Redirecting to: {}", targetUrl);
        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
