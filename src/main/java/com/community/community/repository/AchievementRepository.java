package com.community.community.repository;

import com.community.community.model.Achievement;
import com.community.community.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AchievementRepository extends JpaRepository<Achievement, Long> {
    
    List<Achievement> findByUser(User user);
    
    List<Achievement> findByUserId(Long userId);
    
    List<Achievement> findByCategory(String category);
    
    @Query("SELECT SUM(a.points) FROM Achievement a WHERE a.user.id = ?1")
    Integer getTotalPointsByUserId(Long userId);
    
    List<Achievement> findByUserOrderByAchievedAtDesc(User user);
}
