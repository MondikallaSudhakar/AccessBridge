package com.community.community.repository;

import com.community.community.model.NGOSupportRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NGOSupportRequestRepository extends JpaRepository<NGOSupportRequest, Long> {
    List<NGOSupportRequest> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
    List<NGOSupportRequest> findByRequesterEmailOrderByCreatedAtDesc(String requesterEmail);
}
