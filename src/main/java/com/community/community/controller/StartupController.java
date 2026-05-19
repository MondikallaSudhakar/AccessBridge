package com.community.community.controller;

import com.community.community.model.Startup;
import com.community.community.model.Role;
import com.community.community.service.StartupService;
import com.community.community.service.StartupSubscriptionService;
import com.community.community.model.StartupJob;
import com.community.community.model.StartupJobApplication;
import com.community.community.repository.StartupJobRepository;
import com.community.community.repository.StartupJobApplicationRepository;
import com.community.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/startups")
@RequiredArgsConstructor
public class StartupController {

    private final StartupService startupService;
    private final StartupSubscriptionService startupSubscriptionService;
    private final StartupJobRepository startupJobRepository;
    private final StartupJobApplicationRepository startupJobApplicationRepository;
    private final UserRepository userRepository;

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

    @GetMapping("/{id}/subscription")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> getSubscriptionStatus(@PathVariable Long id) {
        Startup startup = startupService.getStartupById(id);
        return ResponseEntity.ok(buildSubscriptionStatus(startup));
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

    @PostMapping("/{id}/subscription/order")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> createSubscriptionOrder(@PathVariable Long id) {
        return ResponseEntity.ok(startupSubscriptionService.createOrder(id));
    }

    @PostMapping("/{id}/subscription/verify")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> verifySubscriptionPayment(@PathVariable Long id, @RequestBody java.util.Map<String, Object> payload) {
        String orderId = extractString(payload, "orderId", "razorpay_order_id");
        String paymentId = extractString(payload, "paymentId", "razorpay_payment_id");
        String signature = extractString(payload, "signature", "razorpay_signature");
        return ResponseEntity.ok(startupSubscriptionService.verifyAndActivate(id, orderId, paymentId, signature));
    }

    @PostMapping("/{id}/subscription/deactivate")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<java.util.Map<String, Object>> deactivateSubscription(@PathVariable Long id) {
        Startup startup = startupService.deactivateSubscription(id);
        return ResponseEntity.ok(buildSubscriptionStatus(startup));
    }

    // ── Startup Jobs Endpoints (similar to NGO jobs) ─────────────────────────

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<StartupJob>> getStartupJobs(@PathVariable Long id) {
        return ResponseEntity.ok(startupJobRepository.findByStartupIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/jobs")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<StartupJob> postStartupJob(@PathVariable Long id, @RequestBody StartupJob req) {
        requireActiveSubscription(id);
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

    private void requireActiveSubscription(Long startupId) {
        if (isSuperAdmin()) {
            return;
        }

        Startup startup = startupService.getStartupById(startupId);
        if (!isSubscriptionActive(startup)) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Active Startup subscription required to post this content");
        }
    }

    private boolean isSuperAdmin() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        return userRepository.findByEmail(authentication.getName())
                .map(user -> user.getRole() == Role.SUPER_ADMIN)
                .orElse(false);
    }

    private boolean isSubscriptionActive(Startup startup) {
        if (startup == null) {
            return false;
        }

        LocalDateTime expiresAt = startup.getSubscriptionExpiresAt();
        boolean expired = expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
        boolean active = Boolean.TRUE.equals(startup.getSubscriptionActive()) && !expired;

        if (!active && Boolean.TRUE.equals(startup.getSubscriptionActive()) && expired) {
            startup.setSubscriptionActive(false);
            startupService.saveStartup(startup);
        }

        return active;
    }

    private java.util.Map<String, Object> buildSubscriptionStatus(Startup startup) {
        java.util.Map<String, Object> data = new java.util.HashMap<>();
        data.put("active", isSubscriptionActive(startup));
        data.put("plan", startup.getSubscriptionPlan());
        data.put("activatedAt", startup.getSubscriptionActivatedAt());
        data.put("expiresAt", startup.getSubscriptionExpiresAt());
        data.put("orderId", startup.getSubscriptionOrderId());
        data.put("paymentId", startup.getSubscriptionPaymentId());
        data.put("expired", startup.getSubscriptionExpiresAt() != null && startup.getSubscriptionExpiresAt().isBefore(LocalDateTime.now()));
        return data;
    }

    private String extractString(java.util.Map<String, Object> payload, String primaryKey, String fallbackKey) {
        if (payload == null) {
            return null;
        }

        Object value = payload.get(primaryKey);
        if (value == null) {
            value = payload.get(fallbackKey);
        }
        return value == null ? null : String.valueOf(value);
    }
}
