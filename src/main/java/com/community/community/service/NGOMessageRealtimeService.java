package com.community.community.service;

import com.community.community.dto.NGOMessageResponse;
import com.community.community.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class NGOMessageRealtimeService {

    private final JwtUtil jwtUtil;

    private final Map<String, Set<SseEmitter>> emittersByEmail = new ConcurrentHashMap<>();

    public SseEmitter subscribe(String token) {
        if (token == null || token.isBlank()) {
            throw new RuntimeException("Missing token");
        }

        String email = jwtUtil.extractUsername(token);
        if (email == null || !jwtUtil.validateToken(token, email)) {
            throw new RuntimeException("Invalid token");
        }

        SseEmitter emitter = new SseEmitter(0L);
        emittersByEmail.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet()).add(emitter);

        emitter.onCompletion(() -> removeEmitter(email, emitter));
        emitter.onTimeout(() -> removeEmitter(email, emitter));
        emitter.onError((ex) -> removeEmitter(email, emitter));

        try {
            emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException ex) {
            removeEmitter(email, emitter);
        }

        return emitter;
    }

    public void broadcastToUsers(Set<String> emails, NGOMessageResponse message) {
        for (String email : emails) {
            Set<SseEmitter> emitters = emittersByEmail.get(email);
            if (emitters == null) continue;

            for (SseEmitter emitter : emitters) {
                try {
                    emitter.send(SseEmitter.event().name("message").data(message));
                } catch (IOException ex) {
                    emitter.complete();
                    removeEmitter(email, emitter);
                }
            }
        }
    }

    private void removeEmitter(String email, SseEmitter emitter) {
        Set<SseEmitter> emitters = emittersByEmail.get(email);
        if (emitters == null) return;
        emitters.remove(emitter);
        if (emitters.isEmpty()) {
            emittersByEmail.remove(email);
        }
    }
}
