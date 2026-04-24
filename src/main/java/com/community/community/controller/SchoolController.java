package com.community.community.controller;

import com.community.community.model.Need;
import com.community.community.model.School;
import com.community.community.model.SchoolAchievement;
import com.community.community.repository.NeedRepository;
import com.community.community.repository.SchoolAchievementRepository;
import com.community.community.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;
    private final NeedRepository needRepository;
    private final SchoolAchievementRepository achievementRepository;

    // ── School CRUD ──────────────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<School> createSchool(@RequestBody School school) {
        return ResponseEntity.status(HttpStatus.CREATED).body(schoolService.createSchool(school));
    }

    @GetMapping
    public ResponseEntity<List<School>> getAllSchools() {
        return ResponseEntity.ok(schoolService.getAllSchools());
    }

    @GetMapping("/{id}")
    public ResponseEntity<School> getSchoolById(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.getSchoolById(id));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<School> getSchoolByEmail(@PathVariable String email) {
        return ResponseEntity.ok(schoolService.getSchoolByEmail(email));
    }

    @GetMapping("/verified")
    public ResponseEntity<List<School>> getVerifiedSchools() {
        return ResponseEntity.ok(schoolService.getVerifiedSchools());
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<School>> getSchoolsByCity(@PathVariable String city) {
        return ResponseEntity.ok(schoolService.getSchoolsByCity(city));
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<School>> getSchoolsByState(@PathVariable String state) {
        return ResponseEntity.ok(schoolService.getSchoolsByState(state));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<School> updateSchool(@PathVariable Long id, @RequestBody School school) {
        return ResponseEntity.ok(schoolService.updateSchool(id, school));
    }

    @PatchMapping("/{id}/verify")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<School> verifySchool(@PathVariable Long id) {
        return ResponseEntity.ok(schoolService.verifySchool(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }

    // ── Requirements (Needs) Endpoints ──────────────────────────────────────

    @GetMapping("/{id}/needs")
    public ResponseEntity<List<Need>> getSchoolNeeds(@PathVariable Long id) {
        return ResponseEntity.ok(needRepository.findBySchoolId(id));
    }

    @PostMapping("/{id}/needs")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> postSchoolNeed(@PathVariable Long id, @RequestBody Need req) {
        School school = schoolService.getSchoolById(id);
        Need need = new Need();
        need.setTitle(req.getTitle());
        need.setDescription(req.getDescription());
        need.setCategory(req.getCategory());
        need.setTargetAmount(req.getTargetAmount() != null ? req.getTargetAmount() : BigDecimal.ZERO);
        need.setUrgent(req.getUrgent() != null && req.getUrgent());
        need.setDeadline(req.getDeadline());
        need.setStatus("ACTIVE");
        need.setSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(needRepository.save(need));
    }

    @PatchMapping("/needs/{needId}/close")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Need> closeNeed(@PathVariable Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new RuntimeException("Need not found"));
        need.setStatus("CLOSED");
        return ResponseEntity.ok(needRepository.save(need));
    }

    @DeleteMapping("/needs/{needId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteNeed(@PathVariable Long needId) {
        needRepository.deleteById(needId);
        return ResponseEntity.noContent().build();
    }

    // ── Achievements Endpoints ───────────────────────────────────────────────

    /** Public – list all achievements for a school */
    @GetMapping("/{id}/achievements")
    public ResponseEntity<List<SchoolAchievement>> getAchievements(@PathVariable Long id) {
        return ResponseEntity.ok(achievementRepository.findBySchoolIdOrderByYearDescCreatedAtDesc(id));
    }

    /** Protected – create a new achievement */
    @PostMapping("/{id}/achievements")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolAchievement> postAchievement(
            @PathVariable Long id,
            @RequestBody SchoolAchievement req) {
        School school = schoolService.getSchoolById(id);
        SchoolAchievement a = new SchoolAchievement();
        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        a.setCategory(req.getCategory() != null ? req.getCategory() : "OTHER");
        a.setYear(req.getYear());
        a.setImageUrl(req.getImageUrl());
        a.setSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(achievementRepository.save(a));
    }

    /** Protected – update an existing achievement */
    @PutMapping("/achievements/{achievementId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<SchoolAchievement> updateAchievement(
            @PathVariable Long achievementId,
            @RequestBody SchoolAchievement req) {
        SchoolAchievement a = achievementRepository.findById(achievementId)
                .orElseThrow(() -> new RuntimeException("Achievement not found"));
        a.setTitle(req.getTitle());
        a.setDescription(req.getDescription());
        if (req.getCategory() != null) a.setCategory(req.getCategory());
        a.setYear(req.getYear());
        a.setImageUrl(req.getImageUrl());
        return ResponseEntity.ok(achievementRepository.save(a));
    }

    /** Protected – delete an achievement */
    @DeleteMapping("/achievements/{achievementId}")
    @PreAuthorize("hasAnyRole('SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteAchievement(@PathVariable Long achievementId) {
        achievementRepository.deleteById(achievementId);
        return ResponseEntity.noContent().build();
    }
}
