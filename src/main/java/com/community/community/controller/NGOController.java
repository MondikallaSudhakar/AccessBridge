package com.community.community.controller;

import com.community.community.model.NGO;
import com.community.community.service.NGOService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class NGOController {

    private final NGOService ngoService;

    @PostMapping
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
    public ResponseEntity<NGO> updateNGO(
            @PathVariable Long id,
            @RequestBody NGO ngo) {
        NGO updatedNGO = ngoService.updateNGO(id, ngo);
        return ResponseEntity.ok(updatedNGO);
    }

    @PatchMapping("/{id}/verify")
    public ResponseEntity<NGO> verifyNGO(@PathVariable Long id) {
        NGO verifiedNGO = ngoService.verifyNGO(id);
        return ResponseEntity.ok(verifiedNGO);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNGO(@PathVariable Long id) {
        ngoService.deleteNGO(id);
        return ResponseEntity.noContent().build();
    }
}
