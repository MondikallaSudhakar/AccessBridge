package com.community.community.controller;

import com.community.community.model.Event;
import com.community.community.model.EventApplication;
import com.community.community.model.NGO;
import com.community.community.model.User;
import com.community.community.repository.EventRepository;
import com.community.community.repository.EventApplicationRepository;
import com.community.community.repository.NGORepository;
import com.community.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/events")
@RequiredArgsConstructor
public class EventController {

    private final EventRepository eventRepository;
    private final EventApplicationRepository eventApplicationRepository;
    private final NGORepository ngoRepository;
    private final UserRepository userRepository;

    // ── Public Event Endpoints ────────────────────────────────────────────

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

    @GetMapping("/{eventId}")
    public ResponseEntity<Event> getEventById(@PathVariable Long eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        return event.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<Event>> getNgoEvents(@PathVariable Long ngoId) {
        Optional<NGO> ngo = ngoRepository.findById(ngoId);
        if (ngo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Event> events = eventRepository.findByNgo(ngo.get())
                .stream()
                .sorted(Comparator.comparing(Event::getEventDate).reversed())
                .toList();
        return ResponseEntity.ok(events);
    }

    // ── NGO Event Management Endpoints ────────────────────────────────────

    @PostMapping("/ngo/{ngoId}/create")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> createEventForNgo(
            @PathVariable Long ngoId,
            @RequestBody Event event) {
        Optional<NGO> ngo = ngoRepository.findById(ngoId);
        if (ngo.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("NGO not found");
        }

        // Get current user as organizer
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> organizer = userRepository.findByEmail(auth.getName());
        if (organizer.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        event.setNgo(ngo.get());
        event.setOrganizer(organizer.get());
        event.setStatus("UPCOMING");
        event.setCreatedAt(LocalDateTime.now());

        Event savedEvent = eventRepository.save(event);
        return ResponseEntity.status(HttpStatus.CREATED).body(savedEvent);
    }

    @PutMapping("/ngo/{ngoId}/events/{eventId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> updateNgoEvent(
            @PathVariable Long ngoId,
            @PathVariable Long eventId,
            @RequestBody Event updatedEvent) {
        Optional<Event> existingEvent = eventRepository.findById(eventId);
        if (existingEvent.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Event not found");
        }

        Event event = existingEvent.get();
        if (event.getNgo() == null || !event.getNgo().getId().equals(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to update this event");
        }

        // Update fields
        if (updatedEvent.getTitle() != null) event.setTitle(updatedEvent.getTitle());
        if (updatedEvent.getDescription() != null) event.setDescription(updatedEvent.getDescription());
        if (updatedEvent.getEventDate() != null) event.setEventDate(updatedEvent.getEventDate());
        if (updatedEvent.getLocation() != null) event.setLocation(updatedEvent.getLocation());
        if (updatedEvent.getCity() != null) event.setCity(updatedEvent.getCity());
        if (updatedEvent.getState() != null) event.setState(updatedEvent.getState());
        if (updatedEvent.getEventType() != null) event.setEventType(updatedEvent.getEventType());
        if (updatedEvent.getMaxParticipants() != null) event.setMaxParticipants(updatedEvent.getMaxParticipants());
        if (updatedEvent.getStatus() != null) event.setStatus(updatedEvent.getStatus());

        event.setUpdatedAt(LocalDateTime.now());
        Event saved = eventRepository.save(event);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/ngo/{ngoId}/events/{eventId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteNgoEvent(
            @PathVariable Long ngoId,
            @PathVariable Long eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Event not found");
        }

        if (event.get().getNgo() == null || !event.get().getNgo().getId().equals(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body("You are not authorized to delete this event");
        }

        eventApplicationRepository.deleteByEvent(event.get());
        eventRepository.deleteById(eventId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    // ── Event Application Endpoints ──────────────────────────────────────

    @PostMapping("/{eventId}/apply")
    @PreAuthorize("hasAnyRole('SPECIAL_ABLED_PERSON', 'USER', 'NGO_ADMIN', 'GUARDIAN_CAREGIVER', 'SUPER_ADMIN')")
    public ResponseEntity<?> applyForEvent(
            @PathVariable Long eventId,
            @RequestBody(required = false) Map<String, String> request) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Event not found");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> user = userRepository.findByEmail(auth.getName());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        // Check if already applied
        Optional<EventApplication> existing = eventApplicationRepository.findByEventAndUser(event.get(), user.get());
        if (existing.isPresent()) {
            return ResponseEntity.status(HttpStatus.CONFLICT)
                    .body("You have already applied for this event");
        }

        EventApplication application = new EventApplication();
        application.setEvent(event.get());
        application.setUser(user.get());
        application.setApplicantName(user.get().getName());
        application.setApplicantEmail(user.get().getEmail());
        if (request != null && request.containsKey("notes")) {
            application.setApplicantNotes(request.get("notes"));
        }
        application.setStatus("PENDING");
        application.setAppliedAt(LocalDateTime.now());

        EventApplication saved = eventApplicationRepository.save(application);

        // Increment registered participants
        event.get().setRegisteredParticipants(
                (event.get().getRegisteredParticipants() != null ? event.get().getRegisteredParticipants() : 0) + 1
        );
        eventRepository.save(event.get());

        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{eventId}/my-application")
    @PreAuthorize("hasAnyRole('SPECIAL_ABLED_PERSON', 'USER', 'NGO_ADMIN', 'GUARDIAN_CAREGIVER', 'SUPER_ADMIN')")
    public ResponseEntity<?> getMyEventApplication(@PathVariable Long eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Event not found");
        }

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Optional<User> user = userRepository.findByEmail(auth.getName());
        if (user.isEmpty()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body("User not found");
        }

        Optional<EventApplication> application = eventApplicationRepository.findByEventAndUser(event.get(), user.get());
        return application
                .<ResponseEntity<?>>map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.noContent().build());
    }

    @GetMapping("/{eventId}/applications")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getEventApplications(
            @PathVariable Long eventId,
            @RequestParam(required = false) String status) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Event not found");
        }

        List<EventApplication> applications;
        if (status != null && !status.isBlank()) {
            applications = eventApplicationRepository.findByEventAndStatus(event.get(), status);
        } else {
            applications = eventApplicationRepository.findByEvent(event.get());
        }

        return ResponseEntity.ok(applications);
    }

    @PatchMapping("/{eventId}/applications/{appId}/approve")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveApplication(
            @PathVariable Long eventId,
            @PathVariable Long appId,
            @RequestBody(required = false) Map<String, String> request) {
        Optional<EventApplication> application = eventApplicationRepository.findById(appId);
        if (application.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Application not found");
        }

        application.get().setStatus("APPROVED");
        if (request != null && request.containsKey("notes")) {
            application.get().setApprovalNotes(request.get("notes"));
        }
        application.get().setUpdatedAt(LocalDateTime.now());

        EventApplication saved = eventApplicationRepository.save(application.get());
        return ResponseEntity.ok(saved);
    }

    @PatchMapping("/{eventId}/applications/{appId}/reject")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectApplication(
            @PathVariable Long eventId,
            @PathVariable Long appId,
            @RequestBody(required = false) Map<String, String> request) {
        Optional<EventApplication> application = eventApplicationRepository.findById(appId);
        if (application.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Application not found");
        }

        application.get().setStatus("REJECTED");
        if (request != null && request.containsKey("notes")) {
            application.get().setApprovalNotes(request.get("notes"));
        }
        application.get().setUpdatedAt(LocalDateTime.now());

        EventApplication saved = eventApplicationRepository.save(application.get());

        // Decrement registered participants if rejecting
        Event event = application.get().getEvent();
        if (event.getRegisteredParticipants() != null && event.getRegisteredParticipants() > 0) {
            event.setRegisteredParticipants(event.getRegisteredParticipants() - 1);
            eventRepository.save(event);
        }

        return ResponseEntity.ok(saved);
    }
}