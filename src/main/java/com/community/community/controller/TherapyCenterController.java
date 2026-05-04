package com.community.community.controller;

import com.community.community.dto.TherapyCenterRequest;
import com.community.community.dto.TherapyCenterResponse;
import com.community.community.dto.TherapyTypeRequest;
import com.community.community.dto.TherapyTypeResponse;
import com.community.community.model.TherapyCenter;
import com.community.community.model.TherapyType;
import com.community.community.repository.TherapyCenterRepository;
import com.community.community.repository.TherapyTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/therapy-centers")
@RequiredArgsConstructor
public class TherapyCenterController {

    private final TherapyCenterRepository therapyCenterRepository;
    private final TherapyTypeRepository therapyTypeRepository;

    // ── Therapy Center CRUD ──────────────────────────────────────────────────

    @PostMapping
    @PreAuthorize("hasAnyRole('THERAPY_CENTER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TherapyCenterResponse> createTherapyCenter(@RequestBody TherapyCenterRequest request) {
        TherapyCenter center = new TherapyCenter();
        center.setName(request.getName());
        center.setEmail(request.getEmail());
        center.setPhone(request.getPhone());
        center.setAddress(request.getAddress());
        center.setBio(request.getBio());
        center.setDescription(request.getDescription());
        center.setRegistrationNumber(request.getRegistrationNumber());
        center.setTherapistsInfo(request.getTherapistsInfo());
        center.setCapacity(request.getCapacity());
        center.setOperatingHours(request.getOperatingHours());
        center.setFacilities(request.getFacilities());
        center.setSpecialization(request.getSpecialization());
        center.setProfileImage(request.getProfileImage());
        center.setWebsite(request.getWebsite());
        
        TherapyCenter saved = therapyCenterRepository.save(center);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(saved));
    }

    @GetMapping
    public ResponseEntity<List<TherapyCenterResponse>> getAllTherapyCenters() {
        List<TherapyCenter> centers = therapyCenterRepository.findAll();
        return ResponseEntity.ok(centers.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/active")
    public ResponseEntity<List<TherapyCenterResponse>> getActiveTherapyCenters() {
        List<TherapyCenter> centers = therapyCenterRepository.findByActiveTrue();
        return ResponseEntity.ok(centers.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/approved")
    public ResponseEntity<List<TherapyCenterResponse>> getApprovedTherapyCenters() {
        List<TherapyCenter> centers = therapyCenterRepository.findByStatusAndActiveTrue("APPROVED");
        return ResponseEntity.ok(centers.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TherapyCenterResponse> getTherapyCenterById(@PathVariable Long id) {
        TherapyCenter center = therapyCenterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Therapy Center not found"));
        return ResponseEntity.ok(convertToResponse(center));
    }

    @GetMapping("/email/{email}")
    public ResponseEntity<TherapyCenterResponse> getTherapyCenterByEmail(@PathVariable String email) {
        TherapyCenter center = therapyCenterRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Therapy Center not found"));
        return ResponseEntity.ok(convertToResponse(center));
    }

    @GetMapping("/specialization/{specialization}")
    public ResponseEntity<List<TherapyCenterResponse>> getTherapyCentersBySpecialization(@PathVariable String specialization) {
        List<TherapyCenter> centers = therapyCenterRepository.findBySpecialization(specialization);
        return ResponseEntity.ok(centers.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('THERAPY_CENTER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TherapyCenterResponse> updateTherapyCenter(@PathVariable Long id, @RequestBody TherapyCenterRequest request) {
        TherapyCenter center = therapyCenterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Therapy Center not found"));
        
        center.setName(request.getName());
        center.setEmail(request.getEmail());
        center.setPhone(request.getPhone());
        center.setAddress(request.getAddress());
        center.setBio(request.getBio());
        center.setDescription(request.getDescription());
        center.setRegistrationNumber(request.getRegistrationNumber());
        center.setTherapistsInfo(request.getTherapistsInfo());
        center.setCapacity(request.getCapacity());
        center.setOperatingHours(request.getOperatingHours());
        center.setFacilities(request.getFacilities());
        center.setSpecialization(request.getSpecialization());
        center.setProfileImage(request.getProfileImage());
        center.setWebsite(request.getWebsite());
        
        TherapyCenter updated = therapyCenterRepository.save(center);
        return ResponseEntity.ok(convertToResponse(updated));
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TherapyCenterResponse> approveTherapyCenter(@PathVariable Long id) {
        TherapyCenter center = therapyCenterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Therapy Center not found"));
        center.setStatus("APPROVED");
        center.setActive(true);
        TherapyCenter updated = therapyCenterRepository.save(center);
        return ResponseEntity.ok(convertToResponse(updated));
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<TherapyCenterResponse> rejectTherapyCenter(@PathVariable Long id) {
        TherapyCenter center = therapyCenterRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Therapy Center not found"));
        center.setStatus("REJECTED");
        center.setActive(false);
        TherapyCenter updated = therapyCenterRepository.save(center);
        return ResponseEntity.ok(convertToResponse(updated));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('THERAPY_CENTER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTherapyCenter(@PathVariable Long id) {
        therapyCenterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    // ── Therapy Type Endpoints ──────────────────────────────────────────────

    @PostMapping("/{centerId}/therapy-types")
    @PreAuthorize("hasAnyRole('THERAPY_CENTER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TherapyTypeResponse> addTherapyType(@PathVariable Long centerId, @RequestBody TherapyTypeRequest request) {
        TherapyCenter center = therapyCenterRepository.findById(centerId)
            .orElseThrow(() -> new RuntimeException("Therapy Center not found"));
        
        TherapyType type = new TherapyType();
        type.setTypeName(request.getTypeName());
        type.setDescription(request.getDescription());
        type.setAgeGroup(request.getAgeGroup());
        type.setSessionDuration(request.getSessionDuration());
        type.setFrequency(request.getFrequency());
        type.setCost(request.getCost());
        type.setBenefits(request.getBenefits());
        type.setPrerequisites(request.getPrerequisites());
        type.setTherapyCenter(center);
        
        TherapyType saved = therapyTypeRepository.save(type);
        return ResponseEntity.status(HttpStatus.CREATED).body(convertToResponse(saved));
    }

    @GetMapping("/{centerId}/therapy-types")
    public ResponseEntity<List<TherapyTypeResponse>> getTherapyTypesByCenter(@PathVariable Long centerId) {
        List<TherapyType> types = therapyTypeRepository.findByTherapyCenterId(centerId);
        return ResponseEntity.ok(types.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @GetMapping("/therapy-types/{typeId}")
    public ResponseEntity<TherapyTypeResponse> getTherapyTypeById(@PathVariable Long typeId) {
        TherapyType type = therapyTypeRepository.findById(typeId)
            .orElseThrow(() -> new RuntimeException("Therapy Type not found"));
        return ResponseEntity.ok(convertToResponse(type));
    }

    @GetMapping("/therapy-types/search/{typeName}")
    public ResponseEntity<List<TherapyTypeResponse>> searchTherapyTypes(@PathVariable String typeName) {
        List<TherapyType> types = therapyTypeRepository.findByTypeNameContaining(typeName);
        return ResponseEntity.ok(types.stream().map(this::convertToResponse).collect(Collectors.toList()));
    }

    @PutMapping("/therapy-types/{typeId}")
    @PreAuthorize("hasAnyRole('THERAPY_CENTER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<TherapyTypeResponse> updateTherapyType(@PathVariable Long typeId, @RequestBody TherapyTypeRequest request) {
        TherapyType type = therapyTypeRepository.findById(typeId)
            .orElseThrow(() -> new RuntimeException("Therapy Type not found"));
        
        type.setTypeName(request.getTypeName());
        type.setDescription(request.getDescription());
        type.setAgeGroup(request.getAgeGroup());
        type.setSessionDuration(request.getSessionDuration());
        type.setFrequency(request.getFrequency());
        type.setCost(request.getCost());
        type.setBenefits(request.getBenefits());
        type.setPrerequisites(request.getPrerequisites());
        
        TherapyType updated = therapyTypeRepository.save(type);
        return ResponseEntity.ok(convertToResponse(updated));
    }

    @DeleteMapping("/therapy-types/{typeId}")
    @PreAuthorize("hasAnyRole('THERAPY_CENTER_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Void> deleteTherapyType(@PathVariable Long typeId) {
        therapyTypeRepository.deleteById(typeId);
        return ResponseEntity.noContent().build();
    }

    // ── Helper Methods ──────────────────────────────────────────────────────

    private TherapyCenterResponse convertToResponse(TherapyCenter center) {
        TherapyCenterResponse response = new TherapyCenterResponse();
        response.setId(center.getId());
        response.setName(center.getName());
        response.setEmail(center.getEmail());
        response.setPhone(center.getPhone());
        response.setAddress(center.getAddress());
        response.setBio(center.getBio());
        response.setDescription(center.getDescription());
        response.setRegistrationNumber(center.getRegistrationNumber());
        response.setTherapistsInfo(center.getTherapistsInfo());
        response.setCapacity(center.getCapacity());
        response.setOperatingHours(center.getOperatingHours());
        response.setFacilities(center.getFacilities());
        response.setSpecialization(center.getSpecialization());
        response.setProfileImage(center.getProfileImage());
        response.setWebsite(center.getWebsite());
        response.setStatus(center.getStatus());
        response.setActive(center.getActive());
        response.setAdminId(center.getAdminId());
        response.setCreatedAt(center.getCreatedAt());
        response.setUpdatedAt(center.getUpdatedAt());
        response.setTherapyTypes(center.getTherapyTypes().stream().map(this::convertToResponse).collect(Collectors.toList()));
        return response;
    }

    private TherapyTypeResponse convertToResponse(TherapyType type) {
        TherapyTypeResponse response = new TherapyTypeResponse();
        response.setId(type.getId());
        response.setTypeName(type.getTypeName());
        response.setDescription(type.getDescription());
        response.setAgeGroup(type.getAgeGroup());
        response.setSessionDuration(type.getSessionDuration());
        response.setFrequency(type.getFrequency());
        response.setCost(type.getCost());
        response.setBenefits(type.getBenefits());
        response.setPrerequisites(type.getPrerequisites());
        response.setStatus(type.getStatus());
        response.setCreatedAt(type.getCreatedAt());
        response.setUpdatedAt(type.getUpdatedAt());
        return response;
    }
}
