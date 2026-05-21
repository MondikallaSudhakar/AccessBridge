package com.community.community.controller;

import com.community.community.dto.PayoutRequestDto;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.StartupRepository;
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
@RequestMapping("/api/startups")
@RequiredArgsConstructor
public class StartupPayoutRequestController {

    private final PayoutRequestService payoutRequestService;
    private final StartupRepository startupRepository;
    private final UserRepository userRepository;
    private final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(StartupPayoutRequestController.class);

    @GetMapping("/{startupId}/payout-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PayoutRequestDto>> listForStartup(@PathVariable Long startupId) {
        if (!canAccessStartup(startupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        return ResponseEntity.ok(payoutRequestService.listForStartup(startupId));
    }

    @PostMapping("/{startupId}/payout-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutRequestDto> createForStartup(@PathVariable Long startupId, @RequestBody Map<String, Object> payload) {
        if (!canAccessStartup(startupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Number amt = (Number) payload.get("amount");
        String notes = payload.get("notes") == null ? null : payload.get("notes").toString();
        if (amt == null) return ResponseEntity.badRequest().build();
        try {
            PayoutRequestDto dto = payoutRequestService.createRequestForStartup(startupId, BigDecimal.valueOf(amt.doubleValue()), notes);
            return ResponseEntity.status(HttpStatus.CREATED).body(dto);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to create startup payout request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            log.error("Error creating startup payout request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    @PatchMapping("/{startupId}/payout-requests/{id}/cancel")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PayoutRequestDto> cancelForStartup(@PathVariable Long startupId, @PathVariable Long id) {
        if (!canAccessStartup(startupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        try {
            var updated = payoutRequestService.cancelRequestForStartup(startupId, id);
            return ResponseEntity.ok(updated);
        } catch (IllegalArgumentException e) {
            log.warn("Failed to cancel startup payout request: {}", e.getMessage(), e);
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(null);
        } catch (Exception e) {
            log.error("Error cancelling startup payout request", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(null);
        }
    }

    private boolean canAccessStartup(Long startupId) {
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

        if (role != Role.STARTUP_ADMIN) {
            return false;
        }

        return startupRepository.findById(startupId)
                .map(startup -> startup.getEmail() != null && startup.getEmail().equalsIgnoreCase(currentUser.get().getEmail()))
                .orElse(false);
    }
}
