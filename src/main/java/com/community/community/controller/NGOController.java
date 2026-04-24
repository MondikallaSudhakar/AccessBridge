package com.community.community.controller;

import com.community.community.model.NGO;
import com.community.community.model.NGOAchievement;
import com.community.community.model.NGOJob;
import com.community.community.model.NGOProduct;
import com.community.community.model.NGOServiceItem;
import com.community.community.model.NGOSupportRequest;
import com.community.community.model.Need;
import com.community.community.repository.NGOAchievementRepository;
import com.community.community.repository.NGOJobRepository;
import com.community.community.repository.NGOProductRepository;
import com.community.community.repository.NGOServiceItemRepository;
import com.community.community.repository.NGOSupportRequestRepository;
import com.community.community.repository.NeedRepository;
import com.community.community.service.NGOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Locale;

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
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<NGOSupportRequest>> getSupportRequests(@PathVariable Long id) {
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

    // ── Requirements (Needs) Endpoints ──────────────────────────────────────

    @GetMapping("/{id}/needs")
    public ResponseEntity<List<Need>> getNGONeeds(@PathVariable Long id) {
        return ResponseEntity.ok(needRepository.findByNgoId(id));
    }

    @PostMapping("/{id}/needs")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> postNGONeed(@PathVariable Long id, @RequestBody Need req) {
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

    @GetMapping("/{id}/jobs")
    public ResponseEntity<List<NGOJob>> getNGOJobs(@PathVariable Long id) {
        return ResponseEntity.ok(ngoJobRepository.findByNgoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/jobs")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOJob> postNGOJob(@PathVariable Long id, @RequestBody NGOJob req) {
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

    @GetMapping("/{id}/services")
    public ResponseEntity<List<NGOServiceItem>> getNGOServices(@PathVariable Long id) {
        return ResponseEntity.ok(ngoServiceItemRepository.findByNgoIdOrderByCreatedAtDesc(id));
    }

    @PostMapping("/{id}/services")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<NGOServiceItem> postNGOService(@PathVariable Long id, @RequestBody NGOServiceItem req) {
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
}
