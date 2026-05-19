package com.community.community.controller;

import com.community.community.model.NGO;
import com.community.community.model.NGOAchievement;
import com.community.community.model.NGOCampaign;
import com.community.community.model.Course;
import com.community.community.model.NGOJob;
import com.community.community.model.NGOProduct;
import com.community.community.model.NGOServiceItem;
import com.community.community.model.NGOSupportRequest;
import com.community.community.model.NGOVolunteerProfile;
import com.community.community.model.Need;
import com.community.community.model.JobApplication;
import com.community.community.model.Event;
import com.community.community.model.EventApplication;
import com.community.community.repository.NGOAchievementRepository;
import com.community.community.repository.NGOCampaignRepository;
import com.community.community.repository.CourseRepository;
import com.community.community.repository.NGOJobRepository;
import com.community.community.repository.NGOProductRepository;
import com.community.community.repository.NGOServiceItemRepository;
import com.community.community.repository.NGOSupportRequestRepository;
import com.community.community.repository.NGOVolunteerProfileRepository;
import com.community.community.repository.NeedRepository;
import com.community.community.repository.JobApplicationRepository;
import com.community.community.repository.EventRepository;
import com.community.community.repository.EventApplicationRepository;
import com.community.community.repository.UserRepository;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.service.NGOService;
import com.community.community.service.RazorpaySubscriptionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class NGOController {

    private final NGOService ngoService;
    private final NeedRepository needRepository;
    private final NGOJobRepository ngoJobRepository;
    private final NGOProductRepository ngoProductRepository;
    private final NGOServiceItemRepository ngoServiceItemRepository;
    private final NGOAchievementRepository ngoAchievementRepository;
    private final NGOSupportRequestRepository ngoSupportRequestRepository;
    private final NGOVolunteerProfileRepository ngoVolunteerProfileRepository;
    private final NGOCampaignRepository ngoCampaignRepository;
    private final CourseRepository courseRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EventRepository eventRepository;
    private final EventApplicationRepository eventApplicationRepository;
    private final UserRepository userRepository;
    private final RazorpaySubscriptionService razorpaySubscriptionService;

    @PostMapping
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGO> createNGO(@RequestBody NGO ngo) {
        NGO createdNGO = ngoService.createNGO(ngo);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNGO);
    }

    @GetMapping
    public ResponseEntity<List<NGO>> getAllNGOs() {
        List<NGO> ngos = ngoService.getAllNGOs();
        return ResponseEntity.ok(ngos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NGO> getNGOById(@PathVariable Long id) {
        NGO ngo = ngoService.getNGOById(id);
        return ResponseEntity.ok(ngo);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<NGO> getNGOByEmail(@PathVariable String email) {
        NGO ngo = ngoService.getNGOByEmail(email);
        return ResponseEntity.ok(ngo);
    }

    @GetMapping("/registration/{registrationNumber}")
    public ResponseEntity<NGO> getNGOByRegistrationNumber(@PathVariable String registrationNumber) {
        NGO ngo = ngoService.getNGOByRegistrationNumber(registrationNumber);
        return ResponseEntity.ok(ngo);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<NGO>> getVerifiedNGOs() {
        List<NGO> ngos = ngoService.getVerifiedNGOs();
        return ResponseEntity.ok(ngos);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<NGO>> getNGOsByCity(@PathVariable String city) {
        List<NGO> ngos = ngoService.getNGOsByCity(city);
        return ResponseEntity.ok(ngos);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGO> updateNGO(
            @PathVariable Long id,
            @RequestBody NGO ngo) {
        NGO updatedNGO = ngoService.updateNGO(id, ngo);
        return ResponseEntity.ok(updatedNGO);
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<NGO> verifyNGO(@PathVariable Long id) {
        NGO verifiedNGO = ngoService.verifyNGO(id);
        return ResponseEntity.ok(verifiedNGO);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNGO(@PathVariable Long id) {
        ngoService.deleteNGO(id);
        return ResponseEntity.noContent().build();
    }

    // ── NGO Support Requests (user help requests) ──────────────────────────

    @GetMapping("/{id}/support-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<NGOSupportRequest>> getSupportRequests(@PathVariable Long id) {
        if (!canAccessNgo(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(ngoSupportRequestRepository.findByNgoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/support-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<NGOSupportRequest> createSupportRequest(@PathVariable Long id, @RequestBody NGOSupportRequest req) {
        NGO ngo = ngoService.getNGOById(id);

        NGOSupportRequest request = new NGOSupportRequest();
        request.setNgo(ngo);
        request.setRequesterName(req.getRequesterName());
        request.setRequesterEmail(req.getRequesterEmail());
        request.setRequesterPhone(req.getRequesterPhone());
        request.setRequestType(req.getRequestType() == null || req.getRequestType().isBlank() ? "GENERAL_SUPPORT" : req.getRequestType());
        request.setTitle(req.getTitle());
        request.setDescription(req.getDescription());
        request.setPreferredCity(req.getPreferredCity());
        request.setStatus("PENDING");

        return ResponseEntity.status(HttpStatus.CREATED).body(ngoSupportRequestRepository.save(request));
    }

    @PatchMapping("/support-requests/{requestId}/status")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOSupportRequest> updateSupportRequestStatus(
            @PathVariable Long requestId,
            @RequestParam String status,
            @RequestParam(required = false) String ngoResponseNote) {
        NGOSupportRequest request = ngoSupportRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Support request not found"));

        String normalizedStatus = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (!normalizedStatus.equals("ACCEPTED") && !normalizedStatus.equals("DECLINED") && !normalizedStatus.equals("PENDING")) {
            throw new RuntimeException("Invalid status. Allowed values: PENDING, ACCEPTED, DECLINED");
        }

        request.setStatus(normalizedStatus);
        request.setNgoResponseNote(ngoResponseNote);
        return ResponseEntity.ok(ngoSupportRequestRepository.save(request));
    }

    @GetMapping("/support-requests/history")
    public ResponseEntity<List<NGOSupportRequest>> getMyRequestHistory(@RequestParam String email) {
        if (email == null || email.isBlank()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        return ResponseEntity.ok(ngoSupportRequestRepository.findByRequesterEmailOrderByCreatedAtDesc(email.trim()));
    }

    // ── Volunteer Profiles Endpoints ───────────────────────────────────────

    @GetMapping("/{id}/volunteers")
    public ResponseEntity<List<NGOVolunteerProfile>> getVolunteerProfiles(@PathVariable Long id) {
        // Public endpoint: return only volunteer profiles that have been accepted/published
        List<NGOVolunteerProfile> accepted = ngoVolunteerProfileRepository.findByNgoIdAndStatusOrderByCreatedAtDesc(id, "ACCEPTED");
        return ResponseEntity.ok(accepted);
    }

    @PostMapping("/{id}/volunteers")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOVolunteerProfile> createVolunteerProfile(@PathVariable Long id, @RequestBody NGOVolunteerProfile req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        NGOVolunteerProfile profile = new NGOVolunteerProfile();
        profile.setNgo(ngo);
        profile.setFullName(req.getFullName());
        profile.setEmail(req.getEmail());
        profile.setPhone(req.getPhone());
        profile.setSkills(req.getSkills());
        profile.setAvailability(req.getAvailability());
        profile.setPreferredCity(req.getPreferredCity());
        profile.setStatus(req.getStatus() == null || req.getStatus().isBlank() ? "PENDING" : req.getStatus());
        profile.setNote(req.getNote());
        return ResponseEntity.status(HttpStatus.CREATED).body(ngoVolunteerProfileRepository.save(profile));
    }

    @PutMapping("/volunteers/{volunteerId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOVolunteerProfile> updateVolunteerProfile(@PathVariable Long volunteerId, @RequestBody NGOVolunteerProfile req) {
        NGOVolunteerProfile profile = ngoVolunteerProfileRepository.findById(volunteerId)
                .orElseThrow(() -> new RuntimeException("Volunteer profile not found"));
        profile.setFullName(req.getFullName());
        profile.setEmail(req.getEmail());
        profile.setPhone(req.getPhone());
        profile.setSkills(req.getSkills());
        profile.setAvailability(req.getAvailability());
        profile.setPreferredCity(req.getPreferredCity());
        profile.setStatus(req.getStatus() == null || req.getStatus().isBlank() ? profile.getStatus() : req.getStatus());
        profile.setNote(req.getNote());
        return ResponseEntity.ok(ngoVolunteerProfileRepository.save(profile));
    }

    @DeleteMapping("/volunteers/{volunteerId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteVolunteerProfile(@PathVariable Long volunteerId) {
        ngoVolunteerProfileRepository.deleteById(volunteerId);
        return ResponseEntity.noContent().build();
    }

    // ── Campaigns Endpoints ────────────────────────────────────────────────

    @GetMapping("/{id}/campaigns")
    public ResponseEntity<List<NGOCampaign>> getCampaigns(@PathVariable Long id) {
        return ResponseEntity.ok(ngoCampaignRepository.findByNgoIdOrderByIdDesc(id));
    }

    @PostMapping("/{id}/campaigns")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOCampaign> createCampaign(@PathVariable Long id, @RequestBody NGOCampaign req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        NGOCampaign campaign = new NGOCampaign();
        campaign.setNgo(ngo);
        campaign.setTitle(req.getTitle());
        campaign.setObjective(req.getObjective());
        campaign.setStartDate(req.getStartDate());
        campaign.setEndDate(req.getEndDate());
        campaign.setTargetBeneficiaries(req.getTargetBeneficiaries());
        campaign.setVolunteerTarget(req.getVolunteerTarget());
        campaign.setSpentAmount(req.getSpentAmount());
        campaign.setStatus(req.getStatus() == null || req.getStatus().isBlank() ? "PLANNED" : req.getStatus());
        campaign.setImpactSummary(req.getImpactSummary());
        return ResponseEntity.status(HttpStatus.CREATED).body(ngoCampaignRepository.save(campaign));
    }

    @PutMapping("/campaigns/{campaignId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOCampaign> updateCampaign(@PathVariable Long campaignId, @RequestBody NGOCampaign req) {
        NGOCampaign campaign = ngoCampaignRepository.findById(campaignId)
                .orElseThrow(() -> new RuntimeException("Campaign not found"));
        campaign.setTitle(req.getTitle());
        campaign.setObjective(req.getObjective());
        campaign.setStartDate(req.getStartDate());
        campaign.setEndDate(req.getEndDate());
        campaign.setTargetBeneficiaries(req.getTargetBeneficiaries());
        campaign.setVolunteerTarget(req.getVolunteerTarget());
        campaign.setSpentAmount(req.getSpentAmount());
        campaign.setStatus(req.getStatus() == null || req.getStatus().isBlank() ? campaign.getStatus() : req.getStatus());
        campaign.setImpactSummary(req.getImpactSummary());
        return ResponseEntity.ok(ngoCampaignRepository.save(campaign));
    }

    @DeleteMapping("/campaigns/{campaignId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteCampaign(@PathVariable Long campaignId) {
        ngoCampaignRepository.deleteById(campaignId);
        return ResponseEntity.noContent().build();
    }

    // ── Courses Endpoints ──────────────────────────────────────────────────

    @GetMapping("/{id}/courses")
    public ResponseEntity<List<Course>> getNGOCourses(@PathVariable Long id) {
        NGO ngo = ngoService.getNGOById(id);
        return ResponseEntity.ok(courseRepository.findByNgo(ngo));
    }

    @PostMapping("/{id}/courses")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Course> createNGOCourse(@PathVariable Long id, @RequestBody Course req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        Course course = new Course();
        course.setNgo(ngo);
        course.setSchool(null);
        course.setCourseTitle(req.getCourseTitle());
        course.setDescription(req.getDescription());
        course.setCategory(req.getCategory());
        course.setStartDate(req.getStartDate());
        course.setEndDate(req.getEndDate());
        course.setCapacity(req.getCapacity() != null ? req.getCapacity() : 30);
        course.setEnrolled(req.getEnrolled() != null ? req.getEnrolled() : 0);
        course.setStatus(req.getStatus() == null || req.getStatus().isBlank() ? "ACTIVE" : req.getStatus());
        course.setSyllabus(req.getSyllabus());
        course.setInstructorName(req.getInstructorName());
        course.setInstructorEmail(req.getInstructorEmail());
        return ResponseEntity.status(HttpStatus.CREATED).body(courseRepository.save(course));
    }

    @GetMapping("/courses/{courseId}")
    public ResponseEntity<Course> getNGOCourse(@PathVariable Long courseId) {
        return ResponseEntity.ok(courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found")));
    }

    @DeleteMapping("/courses/{courseId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNGOCourse(@PathVariable Long courseId) {
        courseRepository.deleteById(courseId);
        return ResponseEntity.noContent().build();
    }

    // ── Requirements (Needs) Endpoints ──────────────────────────────────────

    @GetMapping("/volunteer-needs")
    public ResponseEntity<List<Map<String, Object>>> getAllVolunteerNeeds() {
        List<Map<String, Object>> data = needRepository.findByCategory("VOLUNTEER_NEED").stream()
                .filter(need -> "ACTIVE".equalsIgnoreCase(need.getStatus()))
                .map(need -> {
                    Map<String, Object> item = new HashMap<>();
                    item.put("id", need.getId());
                    item.put("title", need.getTitle());
                    item.put("description", need.getDescription());
                    item.put("category", need.getCategory());
                    item.put("status", need.getStatus());
                    item.put("urgent", need.getUrgent());
                    item.put("createdAt", need.getCreatedAt());
                    item.put("deadline", need.getDeadline());
                    item.put("volunteersNeeded", need.getTargetAmount() == null ? 0 : need.getTargetAmount().intValue());

                    NGO ngo = need.getNgo();
                    item.put("ngoId", ngo == null ? null : ngo.getId());
                    item.put("ngoName", ngo == null ? "NGO" : ngo.getName());
                    item.put("ngoCity", ngo == null ? null : ngo.getCity());

                    return item;
                })
                .collect(Collectors.toList());

        return ResponseEntity.ok(data);
    }

    @GetMapping("/{id}/needs")
    public ResponseEntity<List<Need>> getNGONeeds(@PathVariable Long id) {
        return ResponseEntity.ok(needRepository.findByNgoId(id));
    }

    @PostMapping("/{id}/needs")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> postNGONeed(@PathVariable Long id, @RequestBody Need req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        Need need = new Need();
        need.setTitle(req.getTitle());
        need.setDescription(req.getDescription());
        need.setCategory(req.getCategory());
        need.setTargetAmount(req.getTargetAmount() != null ? req.getTargetAmount() : BigDecimal.ZERO);
        need.setUrgent(req.getUrgent() != null && req.getUrgent());
        need.setDeadline(req.getDeadline());
        need.setStatus("ACTIVE");
        need.setNgo(ngo);
        return ResponseEntity.status(HttpStatus.CREATED).body(needRepository.save(need));
    }

    @PatchMapping("/needs/{needId}/close")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> closeNeed(@PathVariable Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new RuntimeException("Need not found"));
        need.setStatus("CLOSED");
        return ResponseEntity.ok(needRepository.save(need));
    }

    @DeleteMapping("/needs/{needId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNeed(@PathVariable Long needId) {
        needRepository.deleteById(needId);
        return ResponseEntity.noContent().build();
    }

    // ── Hiring Requirements (Jobs) Endpoints ────────────────────────────────

    @GetMapping("/jobs/all")
    public ResponseEntity<List<NGOJob>> getAllJobs() {
        return ResponseEntity.ok(ngoJobRepository.findAll());
    }

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<NGOJob>> getNGOJobs(@PathVariable Long id) {
        return ResponseEntity.ok(ngoJobRepository.findByNgoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/jobs")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOJob> postNGOJob(@PathVariable Long id, @RequestBody NGOJob req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        NGOJob job = new NGOJob();
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setEmploymentType(req.getEmploymentType());
        job.setLocation(req.getLocation());
        job.setSalaryRange(req.getSalaryRange());
        job.setApplicationUrl(req.getApplicationUrl());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setStatus(req.getStatus() != null ? req.getStatus() : "OPEN");
        job.setNgo(ngo);
        return ResponseEntity.status(HttpStatus.CREATED).body(ngoJobRepository.save(job));
    }

    @PutMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOJob> updateNGOJob(@PathVariable Long jobId, @RequestBody NGOJob req) {
        NGOJob job = ngoJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        job.setTitle(req.getTitle());
        job.setDescription(req.getDescription());
        job.setEmploymentType(req.getEmploymentType());
        job.setLocation(req.getLocation());
        job.setSalaryRange(req.getSalaryRange());
        job.setApplicationUrl(req.getApplicationUrl());
        job.setLastDateToApply(req.getLastDateToApply());
        job.setStatus(req.getStatus() != null ? req.getStatus() : job.getStatus());
        return ResponseEntity.ok(ngoJobRepository.save(job));
    }

    @DeleteMapping("/jobs/{jobId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNGOJob(@PathVariable Long jobId) {
        ngoJobRepository.deleteById(jobId);
        return ResponseEntity.noContent().build();
    }

    // ── NGO Products Endpoints ───────────────────────────────────────────────

    @GetMapping("/{id}/products")
    public ResponseEntity<List<NGOProduct>> getNGOProducts(@PathVariable Long id) {
        return ResponseEntity.ok(ngoProductRepository.findByNgoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/products")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOProduct> postNGOProduct(@PathVariable Long id, @RequestBody NGOProduct req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        NGOProduct product = new NGOProduct();
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setCategory(req.getCategory());
        product.setPrice(req.getPrice() != null ? req.getPrice() : BigDecimal.ZERO);
        product.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : 0);
        product.setAvailable(req.getAvailable() == null || req.getAvailable());
        product.setImageUrl(req.getImageUrl());
        product.setNgo(ngo);
        return ResponseEntity.status(HttpStatus.CREATED).body(ngoProductRepository.save(product));
    }

    @PutMapping("/products/{productId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOProduct> updateNGOProduct(@PathVariable Long productId, @RequestBody NGOProduct req) {
        NGOProduct product = ngoProductRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("NGO product not found"));
        product.setName(req.getName());
        product.setDescription(req.getDescription());
        product.setCategory(req.getCategory());
        product.setPrice(req.getPrice() != null ? req.getPrice() : product.getPrice());
        product.setStockQuantity(req.getStockQuantity() != null ? req.getStockQuantity() : product.getStockQuantity());
        product.setAvailable(req.getAvailable() != null ? req.getAvailable() : product.getAvailable());
        product.setImageUrl(req.getImageUrl());
        return ResponseEntity.ok(ngoProductRepository.save(product));
    }

    @DeleteMapping("/products/{productId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNGOProduct(@PathVariable Long productId) {
        ngoProductRepository.deleteById(productId);
        return ResponseEntity.noContent().build();
    }

    // ── Services Endpoints (Profile-only user visibility) ───────────────────

    @GetMapping("/services/all")
    public ResponseEntity<List<NGOServiceItem>> getAllServices() {
        return ResponseEntity.ok(ngoServiceItemRepository.findAll());
    }

    @GetMapping("/{id}/services")
    public ResponseEntity<List<NGOServiceItem>> getNGOServices(@PathVariable Long id) {
        return ResponseEntity.ok(ngoServiceItemRepository.findByNgoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/services")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOServiceItem> postNGOService(@PathVariable Long id, @RequestBody NGOServiceItem req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        NGOServiceItem item = new NGOServiceItem();
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setCategory(req.getCategory());
        item.setContactInfo(req.getContactInfo());
        item.setAvailability(req.getAvailability());
        item.setStatus(req.getStatus() != null ? req.getStatus() : "ACTIVE");
        item.setNgo(ngo);
        return ResponseEntity.status(HttpStatus.CREATED).body(ngoServiceItemRepository.save(item));
    }

    @PutMapping("/services/{serviceId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOServiceItem> updateNGOService(@PathVariable Long serviceId, @RequestBody NGOServiceItem req) {
        NGOServiceItem item = ngoServiceItemRepository.findById(serviceId)
                .orElseThrow(() -> new RuntimeException("Service not found"));
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setCategory(req.getCategory());
        item.setContactInfo(req.getContactInfo());
        item.setAvailability(req.getAvailability());
        item.setStatus(req.getStatus() != null ? req.getStatus() : item.getStatus());
        return ResponseEntity.ok(ngoServiceItemRepository.save(item));
    }

    @DeleteMapping("/services/{serviceId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNGOService(@PathVariable Long serviceId) {
        ngoServiceItemRepository.deleteById(serviceId);
        return ResponseEntity.noContent().build();
    }

    // ── Achievements Endpoints (Profile-only user visibility) ───────────────

    @GetMapping("/{id}/achievements")
    public ResponseEntity<List<NGOAchievement>> getNGOAchievements(@PathVariable Long id) {
        return ResponseEntity.ok(ngoAchievementRepository.findByNgoIdOrderByAchievementDateDescCreatedAtDesc(id));
    }

    @PostMapping("/{id}/achievements")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOAchievement> postNGOAchievement(@PathVariable Long id, @RequestBody NGOAchievement req) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        NGOAchievement item = new NGOAchievement();
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setCategory(req.getCategory());
        item.setAchievementDate(req.getAchievementDate());
        item.setImageUrl(req.getImageUrl());
        item.setNgo(ngo);
        return ResponseEntity.status(HttpStatus.CREATED).body(ngoAchievementRepository.save(item));
    }

    @PutMapping("/achievements/{achievementId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOAchievement> updateNGOAchievement(@PathVariable Long achievementId, @RequestBody NGOAchievement req) {
        NGOAchievement item = ngoAchievementRepository.findById(achievementId)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));
        item.setTitle(req.getTitle());
        item.setDescription(req.getDescription());
        item.setCategory(req.getCategory());
        item.setAchievementDate(req.getAchievementDate());
        item.setImageUrl(req.getImageUrl());
        return ResponseEntity.ok(ngoAchievementRepository.save(item));
    }

    @DeleteMapping("/achievements/{achievementId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNGOAchievement(@PathVariable Long achievementId) {
        ngoAchievementRepository.deleteById(achievementId);
        return ResponseEntity.noContent().build();
    }

    // ── Job Applications (in-platform apply) ────────────────────────────────

    @PostMapping("/jobs/{jobId}/apply")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<JobApplication> applyToJob(
            @PathVariable Long jobId,
            @RequestBody JobApplication req) {
        NGOJob job = ngoJobRepository.findById(jobId)
                .orElseThrow(() -> new RuntimeException("Job not found"));
        if (!"OPEN".equalsIgnoreCase(job.getStatus())) {
            return ResponseEntity.badRequest().build();
        }
        if (req.getApplicantEmail() != null &&
                jobApplicationRepository.existsByJobIdAndApplicantEmail(jobId, req.getApplicantEmail())) {
            return ResponseEntity.status(HttpStatus.CONFLICT).build();
        }
        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setApplicantName(req.getApplicantName());
        application.setApplicantEmail(req.getApplicantEmail());
        application.setApplicantPhone(req.getApplicantPhone());
        application.setCoverLetter(req.getCoverLetter());
        application.setResumeText(req.getResumeText());
        application.setAudioNoteFileName(req.getAudioNoteFileName());
        application.setDisabilityType(req.getDisabilityType());
        application.setStatus("PENDING");
        return ResponseEntity.status(HttpStatus.CREATED).body(jobApplicationRepository.save(application));
    }

    @GetMapping("/jobs/{jobId}/applications")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<JobApplication>> getJobApplications(@PathVariable Long jobId) {
        return ResponseEntity.ok(jobApplicationRepository.findByJobIdOrderByAppliedAtDesc(jobId));
    }

    @PatchMapping("/jobs/applications/{applicationId}/status")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<JobApplication> updateApplicationStatus(
            @PathVariable Long applicationId,
            @RequestParam String status,
            @RequestParam(required = false) String reviewNote) {
        JobApplication app = jobApplicationRepository.findById(applicationId)
                .orElseThrow(() -> new RuntimeException("Application not found"));
        String normalized = status == null ? "" : status.trim().toUpperCase(Locale.ROOT);
        if (!normalized.equals("PENDING") && !normalized.equals("SHORTLISTED")
                && !normalized.equals("REJECTED") && !normalized.equals("HIRED")) {
            throw new RuntimeException("Invalid status. Allowed: PENDING, SHORTLISTED, REJECTED, HIRED");
        }
        app.setStatus(normalized);
        app.setNgoReviewNote(reviewNote);
        return ResponseEntity.ok(jobApplicationRepository.save(app));
    }

    // ── Event Management Endpoints ───────────────────────────────────────────

    @GetMapping("/{id}/events")
    public ResponseEntity<List<Event>> getNGOEvents(@PathVariable Long id) {
        if (!canAccessNgo(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        Optional<NGO> ngo = ngoService.getNGOById(id) != null ? Optional.of(ngoService.getNGOById(id)) : Optional.empty();
        if (ngo.isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        List<Event> events = eventRepository.findByNgo(ngo.get())
                .stream()
                .sorted((e1, e2) -> e2.getEventDate().compareTo(e1.getEventDate()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(events);
    }

    @PostMapping("/{id}/events")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Event> createNGOEvent(@PathVariable Long id, @RequestBody Event event) {
        requireActiveSubscription(id);
        NGO ngo = ngoService.getNGOById(id);
        if (ngo == null) {
            return ResponseEntity.notFound().build();
        }
        event.setNgo(ngo);
        event.setStatus("UPCOMING");
        event.setRegisteredParticipants(0);
        return ResponseEntity.status(HttpStatus.CREATED).body(eventRepository.save(event));
    }

    @GetMapping("/{ngoId}/events/{eventId}")
    public ResponseEntity<Event> getNGOEvent(@PathVariable Long ngoId, @PathVariable Long eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty() || event.get().getNgo() == null || !event.get().getNgo().getId().equals(ngoId)) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(event.get());
    }

    @PutMapping("/{ngoId}/events/{eventId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Event> updateNGOEvent(
            @PathVariable Long ngoId,
            @PathVariable Long eventId,
            @RequestBody Event updatedEvent) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty() || event.get().getNgo() == null || !event.get().getNgo().getId().equals(ngoId)) {
            return ResponseEntity.notFound().build();
        }

        Event e = event.get();
        if (updatedEvent.getTitle() != null) e.setTitle(updatedEvent.getTitle());
        if (updatedEvent.getDescription() != null) e.setDescription(updatedEvent.getDescription());
        if (updatedEvent.getEventDate() != null) e.setEventDate(updatedEvent.getEventDate());
        if (updatedEvent.getLocation() != null) e.setLocation(updatedEvent.getLocation());
        if (updatedEvent.getCity() != null) e.setCity(updatedEvent.getCity());
        if (updatedEvent.getState() != null) e.setState(updatedEvent.getState());
        if (updatedEvent.getEventType() != null) e.setEventType(updatedEvent.getEventType());
        if (updatedEvent.getMaxParticipants() != null) e.setMaxParticipants(updatedEvent.getMaxParticipants());
        if (updatedEvent.getStatus() != null) e.setStatus(updatedEvent.getStatus());
        if (updatedEvent.getImageUrl() != null) e.setImageUrl(updatedEvent.getImageUrl());

        return ResponseEntity.ok(eventRepository.save(e));
    }

    @DeleteMapping("/{ngoId}/events/{eventId}")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> deleteNGOEvent(@PathVariable Long ngoId, @PathVariable Long eventId) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty() || event.get().getNgo() == null || !event.get().getNgo().getId().equals(ngoId)) {
            return ResponseEntity.notFound().build();
        }

        eventApplicationRepository.deleteByEvent(event.get());
        eventRepository.deleteById(eventId);
        return ResponseEntity.ok("Event deleted successfully");
    }

    @GetMapping("/{ngoId}/events/{eventId}/applications")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> getNGOEventApplications(
            @PathVariable Long ngoId,
            @PathVariable Long eventId,
            @RequestParam(required = false) String status) {
        Optional<Event> event = eventRepository.findById(eventId);
        if (event.isEmpty() || event.get().getNgo() == null || !event.get().getNgo().getId().equals(ngoId)) {
            return ResponseEntity.notFound().build();
        }

        List<EventApplication> applications;
        if (status != null && !status.isBlank()) {
            applications = eventApplicationRepository.findByEventAndStatus(event.get(), status);
        } else {
            applications = eventApplicationRepository.findByEvent(event.get());
        }

        return ResponseEntity.ok(applications);
    }

    @PatchMapping("/{ngoId}/events/{eventId}/applications/{appId}/approve")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> approveEventApplication(
            @PathVariable Long ngoId,
            @PathVariable Long eventId,
            @PathVariable Long appId,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        Optional<EventApplication> application = eventApplicationRepository.findById(appId);
        if (application.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        application.get().setStatus("APPROVED");
        if (request != null && request.containsKey("notes")) {
            application.get().setApprovalNotes(request.get("notes"));
        }
        application.get().setUpdatedAt(java.time.LocalDateTime.now());

        return ResponseEntity.ok(eventApplicationRepository.save(application.get()));
    }

    @PatchMapping("/{ngoId}/events/{eventId}/applications/{appId}/reject")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<?> rejectEventApplication(
            @PathVariable Long ngoId,
            @PathVariable Long eventId,
            @PathVariable Long appId,
            @RequestBody(required = false) java.util.Map<String, String> request) {
        Optional<EventApplication> application = eventApplicationRepository.findById(appId);
        if (application.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        application.get().setStatus("REJECTED");
        if (request != null && request.containsKey("notes")) {
            application.get().setApprovalNotes(request.get("notes"));
        }
        application.get().setUpdatedAt(java.time.LocalDateTime.now());

        EventApplication saved = eventApplicationRepository.save(application.get());

        // Decrement registered participants
        Event event = application.get().getEvent();
        if (event.getRegisteredParticipants() != null && event.getRegisteredParticipants() > 0) {
            event.setRegisteredParticipants(event.getRegisteredParticipants() - 1);
            eventRepository.save(event);
        }

        return ResponseEntity.ok(saved);
    }

    @GetMapping("/{id}/subscription")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> getSubscriptionStatus(@PathVariable Long id) {
        NGO ngo = ngoService.getNGOById(id);
        return ResponseEntity.ok(buildSubscriptionStatus(ngo));
    }

    @PostMapping("/{id}/subscription/order")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createSubscriptionOrder(@PathVariable Long id) {
        return ResponseEntity.ok(razorpaySubscriptionService.createOrder(id));
    }

    @PostMapping("/{id}/subscription/verify")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> verifySubscriptionPayment(
            @PathVariable Long id,
            @RequestBody Map<String, Object> payload) {
        String orderId = payload == null ? null : (String) payload.get("orderId");
        String paymentId = payload == null ? null : (String) payload.get("paymentId");
        String signature = payload == null ? null : (String) payload.get("signature");
        return ResponseEntity.ok(razorpaySubscriptionService.verifyAndActivate(id, orderId, paymentId, signature));
    }

    @PostMapping("/{id}/subscription/activate")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> activateSubscription(
            @PathVariable Long id,
            @RequestBody(required = false) Map<String, Object> payload) {
        String orderId = payload == null ? null : (String) payload.get("orderId");
        String paymentId = payload == null ? null : (String) payload.get("paymentId");
        String signature = payload == null ? null : (String) payload.get("signature");

        if (orderId == null || paymentId == null || signature == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId, paymentId, and signature are required");
        }

        return ResponseEntity.ok(razorpaySubscriptionService.verifyAndActivate(id, orderId, paymentId, signature));
    }

    @PostMapping("/{id}/subscription/deactivate")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> deactivateSubscription(@PathVariable Long id) {
        NGO ngo = ngoService.deactivateSubscription(id);
        return ResponseEntity.ok(buildSubscriptionStatus(ngo));
    }

    private boolean canAccessNgo(Long ngoId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        User currentUser = userRepository.findByEmail(authentication.getName()).orElse(null);
        if (currentUser == null) {
            return false;
        }

        if (currentUser.getRole() == Role.SUPER_ADMIN) {
            return true;
        }

        if (currentUser.getRole() != Role.NGO_ADMIN) {
            return false;
        }

        NGO ngo = ngoService.getNGOById(ngoId);
        return ngo.getEmail() != null && ngo.getEmail().equalsIgnoreCase(currentUser.getEmail());
    }

    private void requireActiveSubscription(Long ngoId) {
        if (isSuperAdmin()) {
            return;
        }

        NGO ngo = ngoService.getNGOById(ngoId);
        if (!isSubscriptionActive(ngo)) {
            throw new ResponseStatusException(HttpStatus.PAYMENT_REQUIRED, "Active NGO subscription required to post this content");
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

    private boolean isSubscriptionActive(NGO ngo) {
        if (ngo == null) {
            return false;
        }

        LocalDateTime expiresAt = ngo.getSubscriptionExpiresAt();
        boolean expired = expiresAt != null && expiresAt.isBefore(LocalDateTime.now());
        boolean active = Boolean.TRUE.equals(ngo.getSubscriptionActive()) && !expired;

        if (!active && Boolean.TRUE.equals(ngo.getSubscriptionActive()) && expired) {
            ngo.setSubscriptionActive(false);
            ngoService.saveNGO(ngo);
        }

        return active;
    }

    private Map<String, Object> buildSubscriptionStatus(NGO ngo) {
        Map<String, Object> data = new HashMap<>();
        data.put("active", isSubscriptionActive(ngo));
        data.put("plan", ngo.getSubscriptionPlan());
        data.put("activatedAt", ngo.getSubscriptionActivatedAt());
        data.put("expiresAt", ngo.getSubscriptionExpiresAt());
        data.put("orderId", ngo.getSubscriptionOrderId());
        data.put("paymentId", ngo.getSubscriptionPaymentId());
        data.put("expired", ngo.getSubscriptionExpiresAt() != null && ngo.getSubscriptionExpiresAt().isBefore(LocalDateTime.now()));
        return data;
    }
}
