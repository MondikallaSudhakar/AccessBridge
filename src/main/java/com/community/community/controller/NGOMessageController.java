package com.community.community.controller;

import com.community.community.dto.NGOMessageRequest;
import com.community.community.dto.NGOMessageResponse;
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

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@RequiredArgsConstructor
public class NGOMessageController {

    private final NGOMessageService ngoMessageService;
    private final NGOMessageRealtimeService ngoMessageRealtimeService;

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

        try {
            return ResponseEntity.ok(ngoMessageService.getMessagesForNGO(ngoId, principal.getName()));
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
}
