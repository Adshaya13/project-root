package com.backend.service;

import com.backend.dto.admin.AdminUserResponse;
import com.backend.exception.ApiException;
import com.backend.model.User;
import com.backend.repository.UserRepository;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminUserService {

    private final UserRepository userRepository;

    public AdminUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AdminUserResponse setEnabled(Long userId, boolean enabled, String currentAdminEmail) {
        User user = findUser(userId);
        ensureNotSelf(user, currentAdminEmail);

        user.setEnabled(enabled);
        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long userId, String currentAdminEmail) {
        User user = findUser(userId);
        ensureNotSelf(user, currentAdminEmail);
        userRepository.delete(user);
    }

    private User findUser(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "User not found"));
    }

    private void ensureNotSelf(User user, String currentAdminEmail) {
        if (user.getEmail().equalsIgnoreCase(currentAdminEmail)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "You cannot modify your own account");
        }
    }

    private AdminUserResponse toResponse(User user) {
        return new AdminUserResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhone(),
                user.getGender(),
                user.getRole(),
                user.isEnabled(),
                user.isEmailVerified(),
                user.isGoogleAccount(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}