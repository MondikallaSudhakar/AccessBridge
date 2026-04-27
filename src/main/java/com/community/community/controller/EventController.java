package com.community.community.controller;

import com.community.community.model.Event;
import com.community.community.repository.EventRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;

    @GetMapping("/public")
    public ResponseEntity<List<Event>> getPublicEvents(@RequestParam(required = false) String city) {
        LocalDateTime now = LocalDateTime.now();
        List<Event> events = eventRepository.findByEventDateAfter(now)
                .stream()
                .filter(event -> !"CANCELLED".equalsIgnoreCase(event.getStatus()))
                .filter(event -> city == null || city.isBlank() || (event.getCity() != null && event.getCity().equalsIgnoreCase(city)))
                .sorted(Comparator.comparing(Event::getEventDate))
                .toList();
        return ResponseEntity.ok(events);
    }
}