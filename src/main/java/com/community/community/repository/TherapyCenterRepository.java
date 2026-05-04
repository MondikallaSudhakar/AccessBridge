package com.community.community.repository;

import com.community.community.model.TherapyCenter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface TherapyCenterRepository extends JpaRepository<TherapyCenter, Long> {
    
    Optional<TherapyCenter> findByEmail(String email);
    
    Optional<TherapyCenter> findByRegistrationNumber(String registrationNumber);
    
    List<TherapyCenter> findByStatusAndActiveTrue(String status);
    
    List<TherapyCenter> findByAdminId(String adminId);
    
    List<TherapyCenter> findByActiveTrue();
    
    List<TherapyCenter> findBySpecialization(String specialization);
}
