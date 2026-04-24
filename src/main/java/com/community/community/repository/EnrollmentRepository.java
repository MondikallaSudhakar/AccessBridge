package com.community.community.repository;

import com.community.community.model.Enrollment;
import com.community.community.model.Student;
import com.community.community.model.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EnrollmentRepository extends JpaRepository<Enrollment, Long> {
    
    List<Enrollment> findByStudent(Student student);
    
    List<Enrollment> findByCourse(Course course);
    
    Optional<Enrollment> findByStudentAndCourse(Student student, Course course);
    
    List<Enrollment> findByCourseAndStatus(Course course, String status);
    
    List<Enrollment> findByStudentAndStatus(Student student, String status);
}
