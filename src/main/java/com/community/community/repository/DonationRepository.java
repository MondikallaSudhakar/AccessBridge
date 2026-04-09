package com.community.community.repository;

import com.community.community.model.Donation;
import com.community.community.model.User;
import com.community.community.model.Need;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DonationRepository extends JpaRepository<Donation, Long> {
    
    List<Donation> findByDonor(User donor);
    
    List<Donation> findByDonorId(Long donorId);
    
    List<Donation> findByNeed(Need need);
    
    List<Donation> findByNeedId(Long needId);
    
    List<Donation> findByStatus(String status);
    
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.need.id = ?1 AND d.status = 'COMPLETED'")
    BigDecimal getTotalDonationsByNeedId(Long needId);
    
    @Query("SELECT SUM(d.amount) FROM Donation d WHERE d.donor.id = ?1 AND d.status = 'COMPLETED'")
    BigDecimal getTotalDonationsByDonorId(Long donorId);
}
