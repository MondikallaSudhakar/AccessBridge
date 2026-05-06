package com.community.community.repository;

import com.community.community.model.NGOVolunteerProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NGOVolunteerProfileRepository extends JpaRepository<NGOVolunteerProfile, Long> {
    List<NGOVolunteerProfile> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
    List<NGOVolunteerProfile> findByNgoIdAndStatusOrderByCreatedAtDesc(Long ngoId, String status);
}
