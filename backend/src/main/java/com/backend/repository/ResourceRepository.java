package com.backend.repository;

import com.backend.model.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ResourceRepository extends JpaRepository<Resource, Long> {
    Optional<Resource> findByNameIgnoreCase(String name);

    List<Resource> findByActiveTrueAndBookableTrueOrderByNameAsc();
}