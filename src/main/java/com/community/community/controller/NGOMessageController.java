package com.community.community.controller;

import com.community.community.dto.NGOMessageRequest;
import com.community.community.dto.NGOMessageResponse;
import com.community.community.security.JwtUtil;
import com.community.community.service.NGOMessageRealtimeService;
import com.community.community.service.NGOMessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin(origins = {"http://localhost:5173", "http://127.0.0.1:5173"}, allowCredentials = "true")
@RequiredArgsConstructor
public class NGOMessageController {

    private final NGOMessageService ngoMessageService;
    private final NGOMessageRealtimeService ngoMessageRealtimeService;
    private final JwtUtil jwtUtil;

    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream(@RequestParam String token) {
        return ngoMessageRealtimeService.subscribe(token);
    }

    @PostMapping("/ngo/{ngoId}")
    public ResponseEntity<NGOMessageResponse> sendMessageToNGO(
            @PathVariable Long ngoId,
            @RequestBody NGOMessageRequest request,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            Principal principal) {

        String email = resolveRequesterEmail(principal, authorizationHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        NGOMessageResponse response = ngoMessageService.sendMessageToNGO(ngoId, email, request.getContent());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/ngo/{ngoId}")
    public ResponseEntity<List<NGOMessageResponse>> getMessagesForNGO(
            @PathVariable Long ngoId,
            @RequestHeader(value = "Authorization", required = false) String authorizationHeader,
            Principal principal) {

        String email = resolveRequesterEmail(principal, authorizationHeader);
        if (email == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        return ResponseEntity.ok(ngoMessageService.getMessagesForNGO(ngoId, email));
    }

    private String resolveRequesterEmail(Principal principal, String authorizationHeader) {
        if (principal != null) {
            return principal.getName();
        }

        if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
            return null;
        }

        String token = authorizationHeader.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);
            if (email == null || !jwtUtil.validateToken(token, email)) {
                return null;
            }
            return email;
        } catch (Exception ignored) {
            return null;
        }
    }
}
