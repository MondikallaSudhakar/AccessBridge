package com.community.community.controller;

import com.community.community.model.VolunteerApplication;
import com.community.community.repository.VolunteerApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/volunteer-applications")
@RequiredArgsConstructor
public class VolunteerApplicationController {

    private final VolunteerApplicationRepository volunteerApplicationRepository;

    @PostMapping
    public ResponseEntity<VolunteerApplication> submitApplication(@RequestBody VolunteerApplication application) {
        if (application.getStatus() == null || application.getStatus().isBlank()) {
            application.setStatus("PENDING");
        }
        return ResponseEntity.status(HttpStatus.CREATED).body(volunteerApplicationRepository.save(application));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<?> getApplicationsByEmail(@PathVariable String email) {
        return ResponseEntity.ok(volunteerApplicationRepository.findByEmailOrderByCreatedAtDesc(email));
    }
}