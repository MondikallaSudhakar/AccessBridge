package com.community.community.repository;

import com.community.community.model.NGOJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NGOJobRepository extends JpaRepository<NGOJob, Long> {
    List<NGOJob> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
}
