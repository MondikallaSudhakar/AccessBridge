package com.community.community.controller;

import com.community.community.model.VolunteerApplication;
import com.community.community.repository.VolunteerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Locale;
import java.util.Map;

@RestController
@RequestMapping("/api/volunteer-applications")
@RequiredArgsConstructor
public class VolunteerApplicationController {

    private final VolunteerApplicationRepository volunteerApplicationRepository;

    @PostMapping
    public ResponseEntity<VolunteerApplication> submitApplication(@RequestBody Map<String, Object> payload) {
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
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }

        return ResponseEntity.status(HttpStatus.CREATED).body(volunteerApplicationRepository.save(application));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getApplicationsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(volunteerApplicationRepository.findByEmailOrderByCreatedAtDesc(email));
    }

    @GetMapping("/ngo/{ngoId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getApplicationsByNgo(@PathVariable Long ngoId) {
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
}