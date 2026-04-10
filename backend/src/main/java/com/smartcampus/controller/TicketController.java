package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.service.TicketService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
public class TicketController {

    private final TicketService ticketService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> createTicket(
            Authentication authentication,
            @RequestParam(value = "resource_id", required = false) String resourceId,
            @RequestParam(value = "resourceId", required = false) String resourceIdAlias,
            @RequestParam(value = "location", required = false) String location,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "description", required = false) String description,
            @RequestParam(value = "priority", required = false) String priority,
            @RequestParam(value = "contact_details", required = false) String contactDetails,
            @RequestParam(value = "contactDetails", required = false) String contactDetailsAlias,
            @RequestParam(value = "images", required = false) List<MultipartFile> images) {

        String principal = authentication != null ? authentication.getName() : "anonymous";
        String resolvedResourceId = resourceId != null ? resourceId : resourceIdAlias;
        String resolvedContact = contactDetails != null ? contactDetails : contactDetailsAlias;
        log.info("POST /api/tickets for {}", principal);
        Map<String, Object> ticket = ticketService.createTicket(
                principal,
                resolvedResourceId,
                location,
                category,
                description,
                priority,
                resolvedContact,
                List.of());

        return ResponseEntity.ok(ApiResponse.success(ticket, "Ticket created successfully"));
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listTickets(Authentication authentication) {
        String principal = authentication != null ? authentication.getName() : "anonymous";
        List<Map<String, Object>> tickets = ticketService.listTickets(principal);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Retrieved " + tickets.size() + " tickets"));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> listMyTickets(Authentication authentication) {
        String principal = authentication != null ? authentication.getName() : "anonymous";
        List<Map<String, Object>> tickets = ticketService.listMyTickets(principal);
        return ResponseEntity.ok(ApiResponse.success(tickets, "Retrieved " + tickets.size() + " tickets"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getTicketById(@PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.success(ticketService.getById(id), "Retrieved ticket"));
    }

    @PutMapping(value = "/{id}/status", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> updateTicketStatus(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String principal = authentication != null ? authentication.getName() : "anonymous";
        String status = request.get("status") == null ? null : String.valueOf(request.get("status"));
        Map<String, Object> updated = ticketService.updateStatus(id, status, principal);
        return ResponseEntity.ok(ApiResponse.success(updated, "Ticket status updated successfully"));
    }

    @PutMapping(value = "/{id}/assign", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> assignTicket(
            @PathVariable String id,
            @RequestBody Map<String, Object> request,
            Authentication authentication) {

        String principal = authentication != null ? authentication.getName() : "anonymous";
        String technicianId = request.get("technician_id") == null
                ? null
                : String.valueOf(request.get("technician_id"));
        Map<String, Object> updated = ticketService.assignTicket(id, technicianId, principal);
        return ResponseEntity.ok(ApiResponse.success(updated, "Ticket assigned successfully"));
    }
}
