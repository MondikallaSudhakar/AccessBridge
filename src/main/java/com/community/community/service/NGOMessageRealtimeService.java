package com.community.community.service;

import com.community.community.dto.NGOMessageResponse;
import com.community.community.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;
import org.springframework.web.server.ResponseStatusException;
import io.jsonwebtoken.ExpiredJwtException;

import java.io.IOException;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicBoolean;

@Service
@RequiredArgsConstructor
public class NGOMessageRealtimeService {

    private final JwtUtil jwtUtil;

    private final Map<String, Set<ClientEmitter>> emittersByEmail = new ConcurrentHashMap<>();

    private static final long SSE_TIMEOUT_MILLIS = 30 * 60 * 1000L;

    private static final class ClientEmitter {
        private final SseEmitter emitter;
        private final AtomicBoolean closed = new AtomicBoolean(false);

        private ClientEmitter(SseEmitter emitter) {
            this.emitter = emitter;
        }
    }

    public SseEmitter subscribe(String token) {
        if (token == null || token.isBlank()) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Missing token");
        }

        final String email;
        try {
            email = jwtUtil.extractUsername(token);
            if (email == null || !jwtUtil.validateToken(token, email)) {
                throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Invalid token");
            }
        } catch (ExpiredJwtException ex) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Token expired");
        }

        ClientEmitter clientEmitter = new ClientEmitter(new SseEmitter(SSE_TIMEOUT_MILLIS));
        emittersByEmail.computeIfAbsent(email, k -> ConcurrentHashMap.newKeySet()).add(clientEmitter);

        clientEmitter.emitter.onCompletion(() -> closeEmitter(email, clientEmitter));
        clientEmitter.emitter.onTimeout(() -> closeEmitter(email, clientEmitter));
        clientEmitter.emitter.onError((ex) -> closeEmitter(email, clientEmitter));

        try {
            clientEmitter.emitter.send(SseEmitter.event().name("connected").data("ok"));
        } catch (IOException | IllegalStateException ex) {
            closeEmitter(email, clientEmitter);
        }

        return clientEmitter.emitter;
    }

    public void broadcastToUsers(Set<String> emails, NGOMessageResponse message) {
        for (String email : emails) {
            Set<ClientEmitter> emitters = emittersByEmail.get(email);
            if (emitters == null) continue;

            for (ClientEmitter clientEmitter : emitters) {
                if (clientEmitter.closed.get()) {
                    closeEmitter(email, clientEmitter);
                    continue;
                }

                try {
                    clientEmitter.emitter.send(SseEmitter.event().name("message").data(message));
                } catch (IOException | IllegalStateException ex) {
                    closeEmitter(email, clientEmitter);
                }
            }
        }
    }

    private void closeEmitter(String email, ClientEmitter clientEmitter) {
        if (!clientEmitter.closed.compareAndSet(false, true)) {
            return;
        }

        Set<ClientEmitter> emitters = emittersByEmail.get(email);
        if (emitters == null) return;
        emitters.remove(clientEmitter);
        if (emitters.isEmpty()) {
            emittersByEmail.remove(email);
        }
    }
}
