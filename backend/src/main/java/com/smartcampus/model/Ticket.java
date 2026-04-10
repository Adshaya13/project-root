package com.smartcampus.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "tickets")
public class Ticket {

    @Id
    private String id;

    private String category;
    private String description;
    private String location;
    private String priority;
    private String status;

    private String resourceId;
    private String resourceName;
    private String contactDetails;

    private String requesterId;
    private String requesterName;
    private String requesterEmail;

    @Builder.Default
    private List<String> images = new ArrayList<>();

    @CreatedDate
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;
}
