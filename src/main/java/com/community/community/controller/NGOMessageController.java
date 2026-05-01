package com.community.community.controller;

import com.community.community.dto.NGOMessageRequest;
import com.community.community.dto.NGOMessageResponse;
import com.community.community.model.NGO;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.NGORepository;
import com.community.community.repository.UserRepository;
import com.community.community.service.NGOMessageRealtimeService;
import com.community.community.service.NGOMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.Map;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@RequiredArgsConstructor
public class NGOMessageController {

    private final NGOMessageService ngoMessageService;
    private final NGOMessageRealtimeService ngoMessageRealtimeService;
    private final NGORepository ngoRepository;
    private final UserRepository userRepository;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String token) {
        return ngoMessageRealtimeService.subscribe(token);
    }

    @PostMapping("/ngo/{ngoId}")
    public ResponseEntity<?> sendMessageToNGO(
            @PathVariable Long ngoId,
            @RequestBody NGOMessageRequest request,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        try {
            NGOMessageResponse response = ngoMessageService.sendMessageToNGO(
                    ngoId,
                    principal.getName(),
                    request.getContent(),
                    request.getRecipientEmail()
            );
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (RuntimeException ex) {
            return mapError(ex);
        }
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<?> getMessagesForNGO(
            @PathVariable Long ngoId,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!canAccessNgo(ngoId, principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            return ResponseEntity.ok(ngoMessageService.getMessagesForNGO(ngoId, principal.getName()));
        } catch (RuntimeException ex) {
            return mapError(ex);
        }
    }

    @PutMapping("/ngo/{ngoId}/seen")
    public ResponseEntity<?> markMessagesAsSeen(
            @PathVariable Long ngoId,
            @RequestParam(required = false) String senderEmail,
            Principal principal) {
        if (principal == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        if (!canAccessNgo(ngoId, principal.getName())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            List<NGOMessageResponse> updated = ngoMessageService.markMessagesAsSeen(
                    ngoId,
                    principal.getName(),
                    senderEmail
            );
            return ResponseEntity.ok(updated);
        } catch (RuntimeException ex) {
            return mapError(ex);
        }
    }

    private ResponseEntity<Map<String, String>> mapError(RuntimeException ex) {
        String message = ex.getMessage() == null ? "Unexpected error" : ex.getMessage();
        String normalized = message.toLowerCase();

        if (normalized.contains("not found")) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", message));
        }
        if (normalized.contains("cannot be empty")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", message));
    }

    private boolean canAccessNgo(Long ngoId, String email) {
        Optional<User> currentUser = userRepository.findByEmail(email);
        if (currentUser.isEmpty()) {
            return false;
        }

        if (currentUser.get().getRole() == Role.SUPER_ADMIN) {
            return true;
        }

        if (currentUser.get().getRole() != Role.NGO_ADMIN) {
            return false;
        }

        return ngoRepository.findById(ngoId)
                .map(ngo -> ngo.getEmail() != null && ngo.getEmail().equalsIgnoreCase(currentUser.get().getEmail()))
                .orElse(false);
    }
}
