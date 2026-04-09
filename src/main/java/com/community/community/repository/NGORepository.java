package com.community.community.repository;

import com.community.community.model.NGO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface NGORepository extends JpaRepository<NGO, Long> {
    
    Optional<NGO> findByEmail(String email);
    
    List<NGO> findByVerifiedTrue();
    
    List<NGO> findByCity(String city);
    
    Optional<NGO> findByRegistrationNumber(String registrationNumber);
}
