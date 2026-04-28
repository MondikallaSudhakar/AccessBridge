package com.community.community.repository;

import com.community.community.model.Need;
import com.community.community.model.School;
import com.community.community.model.NGO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NeedRepository extends JpaRepository<Need, Long> {
    
    List<Need> findBySchool(School school);
    
    List<Need> findByNgo(NGO ngo);
    
    List<Need> findBySchoolId(Long schoolId);
    
    List<Need> findByNgoId(Long ngoId);
    
    List<Need> findByStatus(String status);
    
    List<Need> findByCategory(String category);
    
    List<Need> findByUrgentTrue();

    List<Need> findBySchoolIsNotNull();
}
