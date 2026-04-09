package com.community.community.repository;

import com.community.community.model.Event;
import com.community.community.model.User;
import com.community.community.model.School;
import com.community.community.model.NGO;
import com.community.community.model.Startup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {
    
    List<Event> findByOrganizer(User organizer);
    
    List<Event> findBySchool(School school);
    
    List<Event> findByNgo(NGO ngo);
    
    List<Event> findByStartup(Startup startup);
    
    List<Event> findByStatus(String status);
    
    List<Event> findByEventType(String eventType);
    
    List<Event> findByCity(String city);
    
    List<Event> findByEventDateAfter(LocalDateTime date);
    
    List<Event> findByEventDateBetween(LocalDateTime startDate, LocalDateTime endDate);
}
