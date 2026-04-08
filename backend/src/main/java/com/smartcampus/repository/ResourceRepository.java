package com.smartcampus.repository;

import com.smartcampus.model.Resource;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ResourceRepository extends MongoRepository<Resource, String> {

    // Filter by type
    List<Resource> findByType(Resource.ResourceType type);

    // Filter by status
    List<Resource> findByStatus(Resource.ResourceStatus status);

    // Filter by type and status
    List<Resource> findByTypeAndStatus(
        Resource.ResourceType type,
        Resource.ResourceStatus status
    );

    // Filter by location (case-insensitive)
    List<Resource> findByLocationContainingIgnoreCase(String location);

    // Filter by minimum capacity
    List<Resource> findByCapacityGreaterThanEqual(int capacity);

    // Search by name (case-insensitive)
    List<Resource> findByNameContainingIgnoreCase(String name);

    // Combined search query
    @Query("{ $and: [ " +
           "{ $or: [ { 'name': { $regex: ?0, $options: 'i' } }, { ?0: '' } ] }, " +
           "{ $or: [ { 'type': ?1 }, { ?1: null } ] }, " +
           "{ $or: [ { 'location': { $regex: ?2, $options: 'i' } }, { ?2: '' } ] }, " +
           "{ $or: [ { 'status': ?3 }, { ?3: null } ] }, " +
           "{ 'capacity': { $gte: ?4 } } " +
           "] }")
    List<Resource> searchResources(
        String name,
        String type,
        String location,
        String status,
        int minCapacity
    );
}
