package com.community.community.repository;

import com.community.community.model.JobApplication;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {

    List<JobApplication> findByJobIdOrderByAppliedAtDesc(Long jobId);

    long countByJobId(Long jobId);

    boolean existsByJobIdAndApplicantEmail(Long jobId, String applicantEmail);
}
