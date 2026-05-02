package com.community.community.repository;

import com.community.community.model.StartupJobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StartupJobApplicationRepository extends JpaRepository<StartupJobApplication, Long> {
    List<StartupJobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);
    boolean existsByJobIdAndApplicantEmail(Long jobId, String email);
}
