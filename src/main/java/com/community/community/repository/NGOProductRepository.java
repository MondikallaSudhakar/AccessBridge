package com.community.community.repository;

import com.community.community.model.NGOProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NGOProductRepository extends JpaRepository<NGOProduct, Long> {
    List<NGOProduct> findByNgoIdOrderByCreatedAtDesc(Long ngoId);
}
