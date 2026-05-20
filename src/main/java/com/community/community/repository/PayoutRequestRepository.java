package com.community.community.repository;

import com.community.community.model.PayoutRequest;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PayoutRequestRepository extends JpaRepository<PayoutRequest, Long> {
    List<PayoutRequest> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
}
