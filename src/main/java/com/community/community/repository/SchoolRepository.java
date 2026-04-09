package com.community.community.repository;

import com.community.community.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface SchoolRepository extends JpaRepository<School, Long> {
    
    Optional<School> findByEmail(String email);
    
    List<School> findByVerifiedTrue();
    
    List<School> findByCity(String city);
    
    List<School> findByState(String state);
}
