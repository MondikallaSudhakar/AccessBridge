package com.community.community.repository;

import com.community.community.model.User;
import com.community.community.model.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.List;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    
    Optional<User> findByEmail(String email);
    
    boolean existsByEmail(String email);
    
    List<User> findByRole(Role role);
    
    List<User> findByActiveTrue();

    List<User> findByStatus(String status);
    
    long countByRole(Role role);
    
    long countByStatus(String status);
    
    long countByRoleAndStatus(Role role, String status);
}
