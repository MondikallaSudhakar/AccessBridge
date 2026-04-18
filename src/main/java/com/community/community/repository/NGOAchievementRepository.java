package com.community.community.repository;

import com.community.community.model.NGOAchievement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NGOAchievementRepository extends JpaRepository<NGOAchievement, Long> {
    List<NGOAchievement> findByNgoIdOrderByAchievementDateDescCreatedAtDesc(Long ngoId);
}
