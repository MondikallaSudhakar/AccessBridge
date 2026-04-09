package com.community.community.repository;

import com.community.community.model.Product;
import com.community.community.model.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    
    List<Product> findByStartup(Startup startup);
    
    List<Product> findByStartupId(Long startupId);
    
    List<Product> findByCategory(String category);
    
    List<Product> findByAvailableTrue();
}
