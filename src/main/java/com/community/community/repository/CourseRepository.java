package com.community.community.repository;

import com.community.community.model.Course;
import com.community.community.model.NGO;
import com.community.community.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    
    List<Course> findBySchool(School school);

    List<Course> findByNgo(NGO ngo);
    
    List<Course> findBySchoolAndStatus(School school, String status);

    List<Course> findByNgoAndStatus(NGO ngo, String status);
    
    List<Course> findBySchoolAndCategory(School school, String category);

    List<Course> findByNgoAndCategory(NGO ngo, String category);
}
