package com.community.community.service;

import com.community.community.model.Event;
import com.community.community.model.EventApplication;
import com.community.community.model.User;
import com.community.community.repository.EventApplicationRepository;
import com.community.community.repository.EventRepository;
import com.community.community.repository.UserRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class EventRegistrationPaymentService {

    private static final URI ORDERS_URI = URI.create("https://api.razorpay.com/v1/orders");

    private final EventRepository eventRepository;
    private final EventApplicationRepository eventApplicationRepository;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    public Map<String, Object> createOrder(Long eventId, Long userId) {
        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (eventApplicationRepository.findByEventAndUser(event, user).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already registered for this event");
        }

        BigDecimal fee = normalizeAmount(event.getRegistrationFee());
        if (fee.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event does not require a registration fee");
        }

        requireConfigured();

        int amountPaise = fee.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValueExact();
        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amountPaise);
        payload.put("currency", currency);
        payload.put("receipt", "event-reg-" + eventId + "-" + userId + "-" + System.currentTimeMillis());
        payload.put("payment_capture", 1);
        payload.put("notes", Map.of(
                "eventId", String.valueOf(eventId),
                "eventTitle", event.getTitle(),
                "userId", String.valueOf(userId),
                "userEmail", user.getEmail(),
                "registrationFee", fee.toPlainString()
        ));

        try {
            HttpRequest request = HttpRequest.newBuilder(ORDERS_URI)
                    .header("Authorization", buildBasicAuthHeader())
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload), StandardCharsets.UTF_8))
                    .build();

            HttpResponse<String> response = HttpClient.newHttpClient().send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay order creation failed: " + response.body());
            }

            Map<String, Object> order = objectMapper.readValue(response.body(), new TypeReference<>() {});
            String orderId = order.get("id") == null ? null : String.valueOf(order.get("id"));
            if (orderId == null || orderId.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Razorpay did not return an order id.");
            }

            Map<String, Object> result = new HashMap<>(order);
            result.put("keyId", razorpayKeyId);
            result.put("amountPaise", amountPaise);
            result.put("amount", fee);
            result.put("currency", currency);
            result.put("eventId", eventId);
            result.put("eventTitle", event.getTitle());
            result.put("registrationFee", fee);
            return result;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to create Razorpay order", ex);
        }
    }

    public EventApplication verifyAndRegister(Long eventId, Long userId, Map<String, Object> payload) {
        requireConfigured();

        Event event = eventRepository.findById(eventId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Event not found"));
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        BigDecimal fee = normalizeAmount(event.getRegistrationFee());
        if (fee.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "This event does not require a registration fee");
        }

        String orderId = extractString(payload, "orderId", "razorpay_order_id");
        String paymentId = extractString(payload, "paymentId", "razorpay_payment_id");
        String signature = extractString(payload, "signature", "razorpay_signature");
        if (orderId == null || orderId.isBlank() || paymentId == null || paymentId.isBlank() || signature == null || signature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId, paymentId, and signature are required");
        }

        if (eventApplicationRepository.findByEventAndUser(event, user).isPresent()) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "You have already registered for this event");
        }

        if (event.getMaxParticipants() != null && event.getMaxParticipants() > 0) {
            int registered = event.getRegisteredParticipants() == null ? 0 : event.getRegisteredParticipants();
            if (registered >= event.getMaxParticipants()) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "This event is fully booked");
            }
        }

        String expectedSignature = generateSignature(orderId, paymentId);
        if (!expectedSignature.equalsIgnoreCase(signature.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay signature");
        }

        EventApplication application = new EventApplication();
        application.setEvent(event);
        application.setUser(user);
        application.setApplicantName(user.getName());
        application.setApplicantEmail(user.getEmail());
        application.setApplicantPhone(extractString(payload, "phone", "applicantPhone"));
        application.setApplicantNotes(extractString(payload, "notes", "applicantNotes"));
        application.setStatus("PENDING");
        application.setPaymentStatus("PAID");
        application.setPaymentOrderId(orderId);
        application.setPaymentId(paymentId);
        application.setPaymentAmount(fee);

        EventApplication saved = eventApplicationRepository.save(application);
        event.setRegisteredParticipants((event.getRegisteredParticipants() == null ? 0 : event.getRegisteredParticipants()) + 1);
        eventRepository.save(event);
        return saved;
    }

    private BigDecimal normalizeAmount(BigDecimal amount) {
        return amount == null ? BigDecimal.ZERO : amount;
    }

    private String extractString(Map<String, Object> payload, String firstKey, String secondKey) {
        if (payload == null) {
            return null;
        }
        Object first = payload.get(firstKey);
        if (first != null && !String.valueOf(first).isBlank()) {
            return String.valueOf(first);
        }
        Object second = payload.get(secondKey);
        return second == null ? null : String.valueOf(second);
    }

    private String buildBasicAuthHeader() {
        String credentials = razorpayKeyId + ":" + razorpayKeySecret;
        return "Basic " + Base64.getEncoder().encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    private void requireConfigured() {
        if (razorpayKeyId == null || razorpayKeyId.isBlank() || razorpayKeySecret == null || razorpayKeySecret.isBlank()) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Razorpay credentials are not configured in application.properties");
        }
    }

    private String generateSignature(String orderId, String paymentId) {
        try {
            Mac mac = Mac.getInstance("HmacSHA256");
            mac.init(new SecretKeySpec(razorpayKeySecret.getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
            byte[] digest = mac.doFinal((orderId + "|" + paymentId).getBytes(StandardCharsets.UTF_8));
            StringBuilder hex = new StringBuilder(digest.length * 2);
            for (byte value : digest) {
                hex.append(String.format("%02x", value));
            }
            return hex.toString();
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Unable to validate Razorpay signature", ex);
        }
    }
}