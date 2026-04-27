package com.community.community.repository;

import com.community.community.model.SpecialCourseEnrollment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SpecialCourseEnrollmentRepository extends JpaRepository<SpecialCourseEnrollment, Long> {
    List<SpecialCourseEnrollment> findBySchoolIdOrderByEnrolledAtDesc(Long schoolId);
    long countByCourseId(Long courseId);
    boolean existsByCourseIdAndEmailIgnoreCase(Long courseId, String email);
}
