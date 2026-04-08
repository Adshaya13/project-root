package com.backend.dto.booking;

import com.backend.model.Resource;
import com.backend.model.ResourceCategory;
import com.backend.model.ResourceType;

import java.time.Instant;

public record ResourceResponse(
        Long id,
        String name,
        ResourceType type,
        ResourceCategory category,
        String location,
        Integer capacity,
        boolean active,
        boolean bookable,
        Instant createdAt,
        Instant updatedAt
) {
    public static ResourceResponse from(Resource resource) {
        return new ResourceResponse(
                resource.getId(),
                resource.getName(),
                resource.getType(),
                resource.getCategory(),
                resource.getLocation(),
                resource.getCapacity(),
                resource.isActive(),
                resource.isBookable(),
                resource.getCreatedAt(),
                resource.getUpdatedAt()
        );
    }
}