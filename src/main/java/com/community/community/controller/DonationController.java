package com.community.community.controller;

import com.community.community.model.Donation;
import com.community.community.service.DonationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/donations")
@RequiredArgsConstructor
public class DonationController {

    private final DonationService donationService;

    @PostMapping
    public ResponseEntity<Donation> createDonation(@RequestBody Donation donation) {
        Donation createdDonation = donationService.createDonation(donation);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdDonation);
    }

    @GetMapping
    public ResponseEntity<List<Donation>> getAllDonations() {
        List<Donation> donations = donationService.getAllDonations();
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Donation> getDonationById(@PathVariable Long id) {
        Donation donation = donationService.getDonationById(id);
        return ResponseEntity.ok(donation);
    }

    @GetMapping("/donor/{donorId}")
    public ResponseEntity<List<Donation>> getDonationsByDonorId(@PathVariable Long donorId) {
        List<Donation> donations = donationService.getDonationsByDonorId(donorId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/need/{needId}")
    public ResponseEntity<List<Donation>> getDonationsByNeedId(@PathVariable Long needId) {
        List<Donation> donations = donationService.getDonationsByNeedId(needId);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<Donation>> getDonationsByStatus(@PathVariable String status) {
        List<Donation> donations = donationService.getDonationsByStatus(status);
        return ResponseEntity.ok(donations);
    }

    @GetMapping("/total/need/{needId}")
    public ResponseEntity<Map<String, BigDecimal>> getTotalDonationsByNeed(@PathVariable Long needId) {
        BigDecimal total = donationService.getTotalDonationsByNeedId(needId);
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalDonations", total);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/total/donor/{donorId}")
    public ResponseEntity<Map<String, BigDecimal>> getTotalDonationsByDonor(@PathVariable Long donorId) {
        BigDecimal total = donationService.getTotalDonationsByDonorId(donorId);
        Map<String, BigDecimal> response = new HashMap<>();
        response.put("totalDonations", total);
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Donation> updateDonationStatus(
            @PathVariable Long id,
            @RequestBody Map<String, String> statusUpdate) {
        String status = statusUpdate.get("status");
        Donation updatedDonation = donationService.updateDonationStatus(id, status);
        return ResponseEntity.ok(updatedDonation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDonation(@PathVariable Long id) {
        donationService.deleteDonation(id);
        return ResponseEntity.noContent().build();
    }
}
