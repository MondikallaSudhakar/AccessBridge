package com.community.community.repository;

import com.community.community.model.EventApplication;
import com.community.community.model.Event;
import com.community.community.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface EventApplicationRepository extends JpaRepository<EventApplication, Long> {

    List<EventApplication> findByEvent(Event event);

    List<EventApplication> findByUser(User user);

    List<EventApplication> findByStatus(String status);

    List<EventApplication> findByEventAndStatus(Event event, String status);

    Optional<EventApplication> findByEventAndUser(Event event, User user);

    List<EventApplication> findByApplicantEmail(String email);

    List<EventApplication> findByEventAndStatusNot(Event event, String status);

    void deleteByEvent(Event event);

    void deleteByUser(User user);
}
