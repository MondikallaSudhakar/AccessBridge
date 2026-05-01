package com.community.community.controller;

import com.community.community.model.VolunteerApplication;
import com.community.community.model.NGO;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.NGORepository;
import com.community.community.repository.UserRepository;
import com.community.community.repository.VolunteerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/volunteer-applications")
@RequiredArgsConstructor
public class VolunteerApplicationController {

    private final VolunteerApplicationRepository volunteerApplicationRepository;
    private final NGORepository ngoRepository;
    private final UserRepository userRepository;

    @PostMapping
    public ResponseEntity<?> submitApplication(@RequestBody Map<String, Object> payload) {
        VolunteerApplication application = new VolunteerApplication();

        application.setFullName(asString(payload.get("fullName"), asString(payload.get("volunteerName"), "")));
        application.setEmail(asString(payload.get("email"), asString(payload.get("volunteerEmail"), "")));
        application.setPhone(asString(payload.get("phone"), null));
        application.setSkills(asString(payload.get("skills"), null));
        application.setAvailability(asString(payload.get("availability"), null));

        String interestType = asString(payload.get("interestType"), "VOLUNTEER_ROLE");
        application.setInterestType(interestType);

        application.setPreferredCause(asString(payload.get("preferredCause"), null));
        application.setPreferredCity(asString(payload.get("preferredCity"), null));
        application.setTargetOrganization(asString(payload.get("targetOrganization"), null));

        String motivation = asString(payload.get("motivationLetter"), asString(payload.get("message"), null));
        application.setMotivationLetter(motivation);
        application.setMessage(motivation);

        application.setNgoId(asLong(payload.get("ngoId")));
        application.setSourceId(asLong(payload.get("sourceId")));
        application.setOpportunityType(asString(payload.get("opportunityType"), null));
        application.setOpportunityTitle(asString(payload.get("opportunityTitle"), null));
        application.setOrganizationName(asString(payload.get("organizationName"), null));

        if (application.getStatus() == null || application.getStatus().isBlank()) {
            application.setStatus("PENDING");
        }

        if (application.getFullName() == null || application.getFullName().isBlank() || application.getEmail() == null || application.getEmail().isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("message", "fullName and email are required"));
        }

        try {
            VolunteerApplication saved = volunteerApplicationRepository.save(application);
            return ResponseEntity.status(HttpStatus.CREATED).body(saved);
        } catch (Exception ex) {
            // Return the exception message to help debugging during development
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("message", ex.getMessage()));
        }
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getApplicationsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(volunteerApplicationRepository.findByEmailOrderByCreatedAtDesc(email));
    }

    @GetMapping("/ngo/{ngoId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getApplicationsByNgo(@PathVariable Long ngoId) {
        if (!canAccessNgo(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(volunteerApplicationRepository.findByNgoIdOrderByCreatedAtDesc(ngoId));
    }

    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<VolunteerApplication> updateStatus(@PathVariable Long id, @RequestParam String status) {
        VolunteerApplication application = volunteerApplicationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Volunteer application not found"));

        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("PENDING") && !normalized.equals("ACCEPTED") && !normalized.equals("REJECTED")) {
            throw new RuntimeException("Invalid status. Allowed values: PENDING, ACCEPTED, REJECTED");
        }

        application.setStatus(normalized);
        return ResponseEntity.ok(volunteerApplicationRepository.save(application));
    }

    private static String asString(Object value, String fallback) {
        if (value == null) return fallback;
        String text = String.valueOf(value).trim();
        return text.isEmpty() ? fallback : text;
    }

    private static Long asLong(Object value) {
        if (value == null) return null;
        if (value instanceof Number number) {
            return number.longValue();
        }
        try {
            return Long.parseLong(String.valueOf(value).trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

    private boolean canAccessNgo(Long ngoId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Optional<User> currentUser = userRepository.findByEmail(authentication.getName());
        if (currentUser.isEmpty()) {
            return false;
        }

        if (currentUser.get().getRole() == Role.SUPER_ADMIN) {
            return true;
        }

        if (currentUser.get().getRole() != Role.NGO_ADMIN) {
            return false;
        }

        return ngoRepository.findById(ngoId)
                .map(ngo -> ngo.getEmail() != null && ngo.getEmail().equalsIgnoreCase(currentUser.get().getEmail()))
                .orElse(false);
    }
}