package com.community.community.repository;

import com.community.community.model.StartupJob;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StartupJobRepository extends JpaRepository<StartupJob, Long> {
    List<StartupJob> findByStartupIdOrderByCreatedAtDesc(Long startupId);
}
