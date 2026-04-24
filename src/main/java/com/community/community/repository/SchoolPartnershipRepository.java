package com.community.community.repository;

import com.community.community.model.SchoolPartnership;
import com.community.community.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SchoolPartnershipRepository extends JpaRepository<SchoolPartnership, Long> {
    
    List<SchoolPartnership> findBySchool(School school);
    
    List<SchoolPartnership> findBySchoolAndStatus(School school, String status);
    
    List<SchoolPartnership> findBySchoolAndPartnershipType(School school, String partnershipType);
}
