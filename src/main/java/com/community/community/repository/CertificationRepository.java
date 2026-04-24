package com.community.community.repository;

import com.community.community.model.Certification;
import com.community.community.model.Student;
import com.community.community.model.School;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CertificationRepository extends JpaRepository<Certification, Long> {
    
    List<Certification> findByStudent(Student student);
    
    List<Certification> findBySchool(School school);
    
    Optional<Certification> findByCertificateId(String certificateId);
    
    List<Certification> findByStudentAndSchool(Student student, School school);
}
