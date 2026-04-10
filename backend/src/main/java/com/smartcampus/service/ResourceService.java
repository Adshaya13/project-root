package com.smartcampus.service;

import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.repository.ResourceRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;
    private final MongoTemplate mongoTemplate;

    // ─── GET ALL (with optional filters pushed to MongoDB) ───────────────────
    public List<ResourceDTO.Response> getAllResources(
            String search,
            String type,
            String location,
            String status,
            Integer minCapacity) {

        log.debug("Fetching resources with filters: search={}, type={}, " +
                  "location={}, status={}, minCapacity={}",
                  search, type, location, status, minCapacity);

        // Build a compound Criteria query — only add clauses for non-blank params
        List<Criteria> clauses = new ArrayList<>();
        
        // Ignore soft-deleted resources
        clauses.add(Criteria.where("isDeleted").ne(true));

        if (search != null && !search.isBlank()) {
            // Case-insensitive regex across name and description
            Criteria searchCriteria = new Criteria().orOperator(
                Criteria.where("name").regex(search, "i"),
                Criteria.where("description").regex(search, "i")
            );
            clauses.add(searchCriteria);
        }

        if (type != null && !type.isBlank()) {
            clauses.add(Criteria.where("type").is(type.toUpperCase()));
        }

        if (location != null && !location.isBlank()) {
            clauses.add(Criteria.where("location").regex(location, "i"));
        }

        if (status != null && !status.isBlank()) {
            clauses.add(Criteria.where("status").is(status.toUpperCase()));
        }

        if (minCapacity != null && minCapacity > 0) {
            clauses.add(Criteria.where("capacity").gte(minCapacity));
        }

        Query query = new Query();
        if (!clauses.isEmpty()) {
            query.addCriteria(new Criteria().andOperator(clauses.toArray(new Criteria[0])));
        }

        List<Resource> resources = mongoTemplate.find(query, Resource.class);
        log.debug("Found {} resource(s) matching filters", resources.size());

        return resources.stream()
                .map(ResourceDTO.Response::from)
                .collect(Collectors.toList());
    }

    // ─── GET BY ID ────────────────────────────────────────────────────────────
    public ResourceDTO.Response getResourceById(String id) {
        log.debug("Fetching resource by id: {}", id);
        Resource resource = findResourceOrThrow(id);
        return ResourceDTO.Response.from(resource);
    }

    // ─── CREATE ───────────────────────────────────────────────────────────────
    public ResourceDTO.Response createResource(ResourceDTO.Request request) {
        log.info("Creating new resource: {}", request.getName());

        Resource resource = Resource.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .availabilityWindows(request.getAvailabilityWindows())
                .status(request.getStatus() != null ? 
                        request.getStatus() : Resource.ResourceStatus.ACTIVE)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .build();

        Resource saved = resourceRepository.save(resource);
        log.info("Resource created with id: {}", saved.getId());
        return ResourceDTO.Response.from(saved);
    }

    // ─── UPDATE ───────────────────────────────────────────────────────────────
    public ResourceDTO.Response updateResource(String id, ResourceDTO.Request request) {
        log.info("Updating resource id: {}", id);

        Resource existing = findResourceOrThrow(id);

        existing.setName(request.getName());
        existing.setType(request.getType());
        existing.setCapacity(request.getCapacity());
        existing.setLocation(request.getLocation());
        existing.setAvailabilityWindows(request.getAvailabilityWindows());
        if (request.getStatus() != null) {
            existing.setStatus(request.getStatus());
        }
        existing.setDescription(request.getDescription());
        existing.setImageUrl(request.getImageUrl());

        Resource updated = resourceRepository.save(existing);
        log.info("Resource updated: {}", updated.getId());
        return ResourceDTO.Response.from(updated);
    }

    // ─── TOGGLE STATUS ────────────────────────────────────────────────────────
    public ResourceDTO.Response toggleStatus(String id) {
        log.info("Toggling status for resource id: {}", id);

        Resource resource = findResourceOrThrow(id);

        if (resource.getStatus() == Resource.ResourceStatus.ACTIVE) {
            resource.setStatus(Resource.ResourceStatus.OUT_OF_SERVICE);
        } else {
            resource.setStatus(Resource.ResourceStatus.ACTIVE);
        }

        Resource updated = resourceRepository.save(resource);
        return ResourceDTO.Response.from(updated);
    }

    // ─── DELETE ───────────────────────────────────────────────────────────────
    public void deleteResource(String id) {
        log.info("Soft-deleting resource id: {}", id);
        Resource resource = findResourceOrThrow(id);
        resource.setDeleted(true);
        resourceRepository.save(resource);
        log.info("Resource soft-deleted: {}", id);
    }

    // ─── HELPER ───────────────────────────────────────────────────────────────
    private Resource findResourceOrThrow(String id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Resource not found with id: " + id));
        
        if (resource.isDeleted()) {
            throw new ResourceNotFoundException("Resource not found with id: " + id);
        }
        
        return resource;
    }
}
