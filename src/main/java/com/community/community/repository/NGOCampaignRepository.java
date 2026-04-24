package com.community.community.repository;

import com.community.community.model.NGOCampaign;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NGOCampaignRepository extends JpaRepository<NGOCampaign, Long> {
    List<NGOCampaign> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
}
