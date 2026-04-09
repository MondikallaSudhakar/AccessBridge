package com.community.community.controller;

import com.community.community.model.Need;
import com.community.community.model.School;
import com.community.community.repository.NeedRepository;
import com.community.community.service.SchoolService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/schools")
@RequiredArgsConstructor
public class SchoolController {

    private final SchoolService schoolService;
    private final NeedRepository needRepository;

    @PostMapping
    public ResponseEntity<School> createSchool(@RequestBody School school) {
        School createdSchool = schoolService.createSchool(school);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdSchool);
    }

    @GetMapping
    public ResponseEntity<List<School>> getAllSchools() {
        List<School> schools = schoolService.getAllSchools();
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/{id}")
    public ResponseEntity<School> getSchoolById(@PathVariable Long id) {
        School school = schoolService.getSchoolById(id);
        return ResponseEntity.ok(school);
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<School> getSchoolByEmail(@PathVariable String email) {
        School school = schoolService.getSchoolByEmail(email);
        return ResponseEntity.ok(school);
    }

    @GetMapping("/verified")
    public ResponseEntity<List<School>> getVerifiedSchools() {
        List<School> schools = schoolService.getVerifiedSchools();
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<List<School>> getSchoolsByCity(@PathVariable String city) {
        List<School> schools = schoolService.getSchoolsByCity(city);
        return ResponseEntity.ok(schools);
    }

    @GetMapping("/state/{state}")
    public ResponseEntity<List<School>> getSchoolsByState(@PathVariable String state) {
        List<School> schools = schoolService.getSchoolsByState(state);
        return ResponseEntity.ok(schools);
    }

    @PutMapping("/{id}")
    public ResponseEntity<School> updateSchool(
            @PathVariable Long id,
            @RequestBody School school) {
        School updatedSchool = schoolService.updateSchool(id, school);
        return ResponseEntity.ok(updatedSchool);
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<School> verifySchool(@PathVariable Long id) {
        School verifiedSchool = schoolService.verifySchool(id);
        return ResponseEntity.ok(verifiedSchool);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSchool(@PathVariable Long id) {
        schoolService.deleteSchool(id);
        return ResponseEntity.noContent().build();
    }

    // ── Requirements (Needs) Endpoints ──────────────────────────────────────

    @GetMapping("/{id}/needs")
    public ResponseEntity<List<Need>> getSchoolNeeds(@PathVariable Long id) {
        List<Need> needs = needRepository.findBySchoolId(id);
        return ResponseEntity.ok(needs);
    }

    @PostMapping("/{id}/needs")
    public ResponseEntity<Need> postSchoolNeed(
            @PathVariable Long id,
            @RequestBody Need needRequest) {
        School school = schoolService.getSchoolById(id);
        Need need = new Need();
        need.setTitle(needRequest.getTitle());
        need.setDescription(needRequest.getDescription());
        need.setCategory(needRequest.getCategory());
        need.setTargetAmount(needRequest.getTargetAmount() != null ? needRequest.getTargetAmount() : BigDecimal.ZERO);
        need.setUrgent(needRequest.getUrgent() != null && needRequest.getUrgent());
        need.setDeadline(needRequest.getDeadline());
        need.setStatus("ACTIVE");
        need.setSchool(school);
        Need saved = needRepository.save(need);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PatchMapping("/needs/{needId}/close")
    public ResponseEntity<Need> closeNeed(@PathVariable Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new RuntimeException("Need not found"));
        need.setStatus("CLOSED");
        return ResponseEntity.ok(needRepository.save(need));
    }

    @DeleteMapping("/needs/{needId}")
    public ResponseEntity<Void> deleteNeed(@PathVariable Long needId) {
        needRepository.deleteById(needId);
        return ResponseEntity.noContent().build();
    }
}
