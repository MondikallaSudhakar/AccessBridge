package com.community.community.controller;

import com.community.community.model.Startup;
import com.community.community.service.StartupService;
import com.community.community.model.StartupJob;
import com.community.community.model.StartupJobApplication;
import com.community.community.repository.StartupJobRepository;
import com.community.community.repository.StartupJobApplicationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/startups")
@RequiredArgsConstructor
public class StartupController {

    private final StartupService startupService;
    private final StartupJobRepository startupJobRepository;
    private final StartupJobApplicationRepository startupJobApplicationRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Startup> createStartup(@RequestBody Startup startup) {
        Startup createdStartup = startupService.createStartup(startup);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdStartup);
    }

    @GetMapping
    public ResponseEntity<List<Startup>> getAllStartups() {
        List<Startup> startups = startupService.getAllStartups();
        return ResponseEntity.ok(startups);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Startup> getStartupById(@PathVariable Long id) {
        Startup startup = startupService.getStartupById(id);
        return ResponseEntity.ok(startup);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<Startup> getStartupByEmail(@PathVariable String email) {
        Startup startup = startupService.getStartupByEmail(email);
        return ResponseEntity.ok(startup);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<Startup>> getVerifiedStartups() {
        List<Startup> startups = startupService.getVerifiedStartups();
        return ResponseEntity.ok(startups);
    }

    @GetMapping("/industry/{industry}")
    public ResponseEntity<List<Startup>> getStartupsByIndustry(@PathVariable String industry) {
        List<Startup> startups = startupService.getStartupsByIndustry(industry);
        return ResponseEntity.ok(startups);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<Startup>> getStartupsByCity(@PathVariable String city) {
        List<Startup> startups = startupService.getStartupsByCity(city);
        return ResponseEntity.ok(startups);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Startup> updateStartup(
            @PathVariable Long id,
            @RequestBody Startup startup) {
        Startup updatedStartup = startupService.updateStartup(id, startup);
        return ResponseEntity.ok(updatedStartup);
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Startup> verifyStartup(@PathVariable Long id) {
        Startup verifiedStartup = startupService.verifyStartup(id);
        return ResponseEntity.ok(verifiedStartup);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteStartup(@PathVariable Long id) {
        startupService.deleteStartup(id);
        return ResponseEntity.noContent().build();
    }

    // ── Startup Jobs Endpoints (similar to NGO jobs) ─────────────────────────

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<StartupJob>> getStartupJobs(@PathVariable Long id) {
        return ResponseEntity.ok(startupJobRepository.findByStartupIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/jobs")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StartupJob> postStartupJob(@PathVariable Long id, @RequestBody StartupJob req) {
        var startup = startupService.getStartupById(id);
        StartupJob job = new StartupJob();
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setEmploymentType(req.getEmploymentType());
        job.setLocation(req.getLocation());
        job.setSalaryRange(req.getSalaryRange());
        job.setApplicationUrl(req.getApplicationUrl());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setStatus(req.getStatus() != null ? req.getStatus() : "OPEN");
        job.setStartup(startup);
        return ResponseEntity.status(HttpStatus.CREATED).body(startupJobRepository.save(job));
    }

    @PutMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StartupJob> updateStartupJob(@PathVariable Long jobId, @RequestBody StartupJob req) {
        StartupJob job = startupJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setEmploymentType(req.getEmploymentType());
        job.setLocation(req.getLocation());
        job.setSalaryRange(req.getSalaryRange());
        job.setApplicationUrl(req.getApplicationUrl());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setStatus(req.getStatus() != null ? req.getStatus() : job.getStatus());
        return ResponseEntity.ok(startupJobRepository.save(job));
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteStartupJob(@PathVariable Long jobId) {
        startupJobRepository.deleteById(jobId);
        return ResponseEntity.noContent().build();
    }

    // ── Job Applications for Startup Jobs ───────────────────────────────────

    @PostMapping("/jobs/{jobId}/apply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<StartupJobApplication> applyToStartupJob(
            @PathVariable Long jobId,
            @RequestBody StartupJobApplication req) {
        StartupJob job = startupJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!"OPEN".equalsIgnoreCase(job.getStatus())) {
            return ResponseEntity.badRequest().build();
        }
        if (req.getApplicantEmail() != null &&
                startupJobApplicationRepository.existsByJobIdAndApplicantEmail(jobId, req.getApplicantEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        StartupJobApplication application = new StartupJobApplication();
        application.setJob(job);
        application.setApplicantName(req.getApplicantName());
        application.setApplicantEmail(req.getApplicantEmail());
        application.setApplicantPhone(req.getApplicantPhone());
        application.setCoverLetter(req.getCoverLetter());
        application.setResumeText(req.getResumeText());
        application.setAudioNoteFileName(req.getAudioNoteFileName());
        application.setDisabilityType(req.getDisabilityType());
        application.setStatus("PENDING");
        return ResponseEntity.status(HttpStatus.CREATED).body(startupJobApplicationRepository.save(application));
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<StartupJobApplication>> getStartupJobApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(startupJobApplicationRepository.findByJobIdOrderByAppliedAtDesc(jobId));
    }

    @PatchMapping("/jobs/applications/{applicationId}/status")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StartupJobApplication> updateStartupApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status,
            @RequestParam(required = false) String reviewNote) {
        StartupJobApplication app = startupJobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        String normalized = status == null ? "" : status.trim().toUpperCase();
        if (!normalized.equals("PENDING") && !normalized.equals("SHORTLISTED")
                && !normalized.equals("REJECTED") && !normalized.equals("HIRED")) {
            throw new RuntimeException("Invalid status. Allowed: PENDING, SHORTLISTED, REJECTED, HIRED");
        }
        app.setStatus(normalized);
        app.setStartupReviewNote(reviewNote);
        return ResponseEntity.ok(startupJobApplicationRepository.save(app));
    }
}
