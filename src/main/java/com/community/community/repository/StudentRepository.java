package com.community.community.repository;

import com.community.community.model.Student;
import com.community.community.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {
    
    Optional<Student> findByEmail(String email);
    
    List<Student> findBySchool(School school);
    
    List<Student> findBySchoolAndStatus(School school, String status);
}
