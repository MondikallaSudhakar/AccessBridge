package com.community.community.repository;

import com.community.community.model.SchoolVolunteer;
import com.community.community.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SchoolVolunteerRepository extends JpaRepository<SchoolVolunteer, Long> {
    
    Optional<SchoolVolunteer> findByVolunteerEmail(String volunteerEmail);
    
    List<SchoolVolunteer> findBySchool(School school);
    
    List<SchoolVolunteer> findBySchoolAndStatus(School school, String status);
    
    List<SchoolVolunteer> findBySchoolAndRole(School school, String role);
}
