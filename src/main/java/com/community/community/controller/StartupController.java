package com.community.community.controller;

import com.community.community.model.Startup;
import com.community.community.service.StartupService;
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
}
