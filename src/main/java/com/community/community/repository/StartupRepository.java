package com.community.community.repository;

import com.community.community.model.Startup;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StartupRepository extends JpaRepository<Startup, Long> {
    
    Optional<Startup> findByEmail(String email);
    
    List<Startup> findByVerifiedTrue();
    
    List<Startup> findByIndustry(String industry);
    
    List<Startup> findByCity(String city);

    @Query("SELECT COUNT(s) FROM Startup s WHERE s.subscriptionActive = TRUE AND s.subscriptionExpiresAt > CURRENT_TIMESTAMP")
    Long countActiveSubscriptions();
}
