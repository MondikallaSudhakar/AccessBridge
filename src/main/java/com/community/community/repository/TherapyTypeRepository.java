package com.community.community.repository;

import com.community.community.model.TherapyType;
import com.community.community.model.TherapyCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TherapyTypeRepository extends JpaRepository<TherapyType, Long> {
    
    List<TherapyType> findByTherapyCenter(TherapyCenter therapyCenter);
    
    List<TherapyType> findByTherapyCenterId(Long centerId);
    
    List<TherapyType> findByTherapyCenterAndStatus(TherapyCenter therapyCenter, String status);
    
    List<TherapyType> findByTypeNameContaining(String typeName);
    
    List<TherapyType> findByStatus(String status);
}
