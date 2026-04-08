package com.backend.model;

public enum ResourceType {
    CLASSROOM(ResourceCategory.SPACE),
    LECTURE_HALL(ResourceCategory.SPACE),
    LAB(ResourceCategory.SPACE),
    MEETING_ROOM(ResourceCategory.SPACE),
    PROJECTOR(ResourceCategory.EQUIPMENT),
    CAMERA(ResourceCategory.EQUIPMENT),
    COMPUTER(ResourceCategory.EQUIPMENT),
    AUDIO_SYSTEM(ResourceCategory.EQUIPMENT);

    private final ResourceCategory category;

    ResourceType(ResourceCategory category) {
        this.category = category;
    }

    public ResourceCategory getCategory() {
        return category;
    }
}