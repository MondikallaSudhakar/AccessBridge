package com.community.community.controller;

import com.community.community.dto.PayoutRequestDto;
import com.community.community.model.Order;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.NGORepository;
import com.community.community.repository.UserRepository;
import com.community.community.service.PayoutRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ngos")
@RequiredArgsConstructor
public class PayoutRequestController {

    private final PayoutRequestService payoutRequestService;
    private final NGORepository ngoRepository;
    private final UserRepository userRepository;

    @GetMapping("/{ngoId}/payout-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PayoutRequestDto>> listForNgo(@PathVariable Long ngoId) {
        if (!canAccessNgo(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(payoutRequestService.listForNgo(ngoId));
    }

    @GetMapping("/payout-requests/all")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<List<PayoutRequestDto>> listAll() {
        return ResponseEntity.ok(payoutRequestService.listAll());
    }

    @PostMapping("/{ngoId}/payout-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutRequestDto> createForNgo(@PathVariable Long ngoId, @RequestBody Map<String, Object> payload) {
        if (!canAccessNgo(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Number amt = (Number) payload.get("amount");
        String notes = payload.get("notes") == null ? null : payload.get("notes").toString();
        if (amt == null) return ResponseEntity.badRequest().build();

        PayoutRequestDto dto = payoutRequestService.createRequest(ngoId, BigDecimal.valueOf(amt.doubleValue()), notes);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }

    @PatchMapping("/payout-requests/{id}/status")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN')")
    public ResponseEntity<PayoutRequestDto> updateStatus(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        if (status == null) return ResponseEntity.badRequest().build();

        var updated = payoutRequestService.updateStatus(id, Enum.valueOf(com.community.community.model.PayoutRequest.Status.class, status));
        return ResponseEntity.ok(updated);
    }

    @PatchMapping("/{ngoId}/payout-requests/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutRequestDto> cancelForNgo(@PathVariable Long ngoId, @PathVariable Long id) {
        if (!canAccessNgo(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        var updated = payoutRequestService.cancelRequest(ngoId, id);
        return ResponseEntity.ok(updated);
    }

    private boolean canAccessNgo(Long ngoId) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            return false;
        }

        Optional<User> currentUser = userRepository.findByEmail(authentication.getName());
        if (currentUser.isEmpty()) {
            return false;
        }

        Role role = currentUser.get().getRole();
        if (role == Role.SUPER_ADMIN) {
            return true;
        }

        if (role != Role.NGO_ADMIN) {
            return false;
        }

        return ngoRepository.findById(ngoId)
                .map(ngo -> ngo.getEmail() != null && ngo.getEmail().equalsIgnoreCase(currentUser.get().getEmail()))
                .orElse(false);
    }
}
