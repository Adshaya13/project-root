package com.smartcampus.service;

import com.smartcampus.exception.BadRequestException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.model.Resource;
import com.smartcampus.model.Ticket;
import com.smartcampus.model.User;
import com.smartcampus.repository.ResourceRepository;
import com.smartcampus.repository.TicketRepository;
import com.smartcampus.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class TicketService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;

    public Map<String, Object> createTicket(
            String requesterEmail,
            String resourceId,
            String location,
            String category,
            String description,
            String priority,
            String contactDetails,
            List<String> imagePaths) {

        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        String normalizedResourceId = normalizeBlank(resourceId);
        String resourceName = null;

        if (normalizedResourceId != null && !"none".equalsIgnoreCase(normalizedResourceId)) {
            Optional<Resource> resource = resourceRepository.findById(normalizedResourceId);
            resourceName = resource.map(Resource::getName).orElse(null);
        }

        Ticket ticket = Ticket.builder()
                .category(trimOrEmpty(category))
                .description(trimOrEmpty(description))
                .location(trimOrEmpty(location))
                .priority(trimOrDefault(priority, "MEDIUM"))
                .status("OPEN")
                .resourceId("none".equalsIgnoreCase(String.valueOf(normalizedResourceId)) ? null : normalizedResourceId)
                .resourceName(resourceName)
                .contactDetails(trimOrEmpty(contactDetails))
                .requesterId(requester.getId())
                .requesterName(requester.getName())
                .requesterEmail(requester.getEmail())
                .images(imagePaths == null ? List.of() : imagePaths)
                .build();

        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    public List<Map<String, Object>> listAllTickets() {
        return ticketRepository.findAll().stream().map(this::toResponse).toList();
    }

    public List<Map<String, Object>> listMyTickets(String requesterEmail) {
        return ticketRepository.findByRequesterEmailOrderByCreatedAtDesc(requesterEmail)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public Map<String, Object> getById(String id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));
        return toResponse(ticket);
    }

    public Map<String, Object> updateStatus(String id, String requestedStatus, String currentUserEmail) {
        User currentUser = userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (currentUser.getRole() != User.Role.ADMIN && currentUser.getRole() != User.Role.TECHNICIAN) {
            throw new AccessDeniedException("Only ADMIN or TECHNICIAN can update ticket status");
        }

        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Ticket not found"));

        String currentStatus = normalizeStatus(ticket.getStatus());
        String newStatus = normalizeStatus(requestedStatus);

        if (newStatus == null) {
            throw new BadRequestException("Status is required");
        }

        if (newStatus.equals(currentStatus)) {
            return toResponse(ticket);
        }

        if (!isAllowedTransition(currentStatus, newStatus)) {
            throw new BadRequestException("Invalid status transition: " + currentStatus + " -> " + newStatus);
        }

        ticket.setStatus(newStatus);
        Ticket saved = ticketRepository.save(ticket);
        return toResponse(saved);
    }

    private boolean isAllowedTransition(String currentStatus, String newStatus) {
        if ("OPEN".equals(currentStatus) && "IN_PROGRESS".equals(newStatus)) {
            return true;
        }
        if ("IN_PROGRESS".equals(currentStatus) && "RESOLVED".equals(newStatus)) {
            return true;
        }
        if ("RESOLVED".equals(currentStatus) && "CLOSED".equals(newStatus)) {
            return true;
        }
        return false;
    }

    private String normalizeStatus(String status) {
        if (status == null) {
            return null;
        }
        return status.trim().toUpperCase(Locale.ROOT);
    }

    private Map<String, Object> toResponse(Ticket ticket) {
        Map<String, Object> response = new HashMap<>();
        response.put("ticket_id", ticket.getId());
        response.put("id", ticket.getId());
        response.put("resource_id", ticket.getResourceId());
        response.put("resource_name", ticket.getResourceName());
        response.put("location", ticket.getLocation());
        response.put("category", ticket.getCategory());
        response.put("description", ticket.getDescription());
        response.put("priority", ticket.getPriority());
        response.put("contact_details", ticket.getContactDetails());
        response.put("status", ticket.getStatus());
        response.put("requester_id", ticket.getRequesterId());
        response.put("requester_name", ticket.getRequesterName());
        response.put("requester_email", ticket.getRequesterEmail());
        response.put("images", ticket.getImages() == null ? List.of() : ticket.getImages());
        response.put("comments", List.of());
        response.put("created_at", ticket.getCreatedAt() == null ? null : ticket.getCreatedAt().toString());
        response.put("updated_at", ticket.getUpdatedAt() == null ? null : ticket.getUpdatedAt().toString());
        return response;
    }

    private String trimOrEmpty(String value) {
        return value == null ? "" : value.trim();
    }

    private String trimOrDefault(String value, String fallback) {
        if (value == null || value.isBlank()) {
            return fallback;
        }
        return value.trim();
    }

    private String normalizeBlank(String value) {
        if (value == null) {
            return null;
        }
        String trimmed = value.trim();
        return trimmed.isEmpty() ? null : trimmed;
    }
}
