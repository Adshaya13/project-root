package com.smartcampus.dto;

import com.smartcampus.model.Resource;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;

import java.time.LocalDateTime;

public class ResourceDTO {

    // ─── Request DTO (Create / Update) ───────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Request {

        @NotBlank(message = "Resource name is required")
        private String name;

        @NotNull(message = "Resource type is required")
        private Resource.ResourceType type;

        @Min(value = 1, message = "Capacity must be at least 1")
        private int capacity;

        @NotBlank(message = "Location is required")
        private String location;

        private String availabilityWindows;

        private Resource.ResourceStatus status;

        private String description;

        private String imageUrl;
    }

    // ─── Response DTO ─────────────────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Response {
        private String id;
        private String name;
        private Resource.ResourceType type;
        private int capacity;
        private String location;
        private String availabilityWindows;
        private Resource.ResourceStatus status;
        private String description;
        private String imageUrl;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;

        // Convenience: map from entity
        public static Response from(Resource resource) {
            return Response.builder()
                    .id(resource.getId())
                    .name(resource.getName())
                    .type(resource.getType())
                    .capacity(resource.getCapacity())
                    .location(resource.getLocation())
                    .availabilityWindows(resource.getAvailabilityWindows())
                    .status(resource.getStatus())
                    .description(resource.getDescription())
                    .imageUrl(resource.getImageUrl())
                    .createdAt(resource.getCreatedAt())
                    .updatedAt(resource.getUpdatedAt())
                    .build();
        }
    }
}
