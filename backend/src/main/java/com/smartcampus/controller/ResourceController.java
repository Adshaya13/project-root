package com.smartcampus.controller;

import com.smartcampus.dto.ApiResponse;
import com.smartcampus.dto.ResourceDTO;
import com.smartcampus.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/resources")
@RequiredArgsConstructor
public class ResourceController {

        private final ResourceService resourceService;

        // ─── GET ALL RESOURCES (with filters) ────────────────────────────────────
        // GET
        // /api/resources?search=lab&type=LAB&location=Block-A&status=ACTIVE&minCapacity=20
        // Accessible by: ALL authenticated roles
        @GetMapping
        public ResponseEntity<ApiResponse<List<ResourceDTO.Response>>> getAllResources(
                        @RequestParam(required = false) String search,
                        @RequestParam(required = false) String type,
                        @RequestParam(required = false) String location,
                        @RequestParam(required = false) String status,
                        @RequestParam(required = false) Integer minCapacity) {

                log.info("GET /api/resources - search={}, type={}, location={}, " +
                                "status={}, minCapacity={}", search, type, location, status, minCapacity);

                List<ResourceDTO.Response> resources = resourceService.getAllResources(
                                search, type, location, status, minCapacity);

                return ResponseEntity.ok(
                                ApiResponse.success(resources,
                                                "Retrieved " + resources.size() + " resources"));
        }

        // ─── GET RESOURCE BY ID ───────────────────────────────────────────────────
        // GET /api/resources/{id}
        // Accessible by: ALL authenticated roles
        @GetMapping("/{id}")
        public ResponseEntity<ApiResponse<ResourceDTO.Response>> getResourceById(
                        @PathVariable String id) {

                log.info("GET /api/resources/{}", id);
                ResourceDTO.Response resource = resourceService.getResourceById(id);
                return ResponseEntity.ok(ApiResponse.success(resource));
        }

        // ─── CREATE RESOURCE ──────────────────────────────────────────────────────
        // POST /api/resources
        // Accessible by: ADMIN only
        @PostMapping
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<ResourceDTO.Response>> createResource(
                        @Valid @RequestBody ResourceDTO.Request request) {

                log.info("POST /api/resources - name={}", request.getName());
                ResourceDTO.Response created = resourceService.createResource(request);
                return ResponseEntity
                                .status(HttpStatus.CREATED)
                                .body(ApiResponse.success(created, "Resource created successfully"));
        }

        // ─── UPDATE RESOURCE ──────────────────────────────────────────────────────
        // PUT /api/resources/{id}
        // Accessible by: ADMIN only
        @PutMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<ResourceDTO.Response>> updateResource(
                        @PathVariable String id,
                        @Valid @RequestBody ResourceDTO.Request request) {

                log.info("PUT /api/resources/{}", id);
                ResourceDTO.Response updated = resourceService.updateResource(id, request);
                return ResponseEntity.ok(
                                ApiResponse.success(updated, "Resource updated successfully"));
        }

        // ─── TOGGLE STATUS ────────────────────────────────────────────────────────
        // PATCH /api/resources/{id}/toggle-status
        // Accessible by: ADMIN only
        @PatchMapping("/{id}/toggle-status")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<ResourceDTO.Response>> toggleStatus(
                        @PathVariable String id) {

                log.info("PATCH /api/resources/{}/toggle-status", id);
                ResourceDTO.Response updated = resourceService.toggleStatus(id);
                return ResponseEntity.ok(
                                ApiResponse.success(updated, "Resource status updated successfully"));
        }

        // ─── DELETE RESOURCE ──────────────────────────────────────────────────────
        // DELETE /api/resources/{id}
        // Accessible by: ADMIN only
        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('ADMIN')")
        public ResponseEntity<ApiResponse<Void>> deleteResource(
                        @PathVariable String id) {

                log.info("DELETE /api/resources/{}", id);
                resourceService.deleteResource(id);
                return ResponseEntity
                                .status(HttpStatus.NO_CONTENT)
                                .body(ApiResponse.success(null, "Resource deleted successfully"));
        }
}
