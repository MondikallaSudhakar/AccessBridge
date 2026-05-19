package com.community.community.service;

import com.community.community.model.Startup;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
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
public class StartupSubscriptionService {

    private static final URI ORDERS_URI = URI.create("https://api.razorpay.com/v1/orders");

    private final StartupService startupService;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    @Value("${razorpay.subscription.amount-paise:49900}")
    private Integer amountPaise;

    @Value("${razorpay.subscription.duration-days:30}")
    private Integer durationDays;

    public Map<String, Object> createOrder(Long startupId) {
        Startup startup = startupService.getStartupById(startupId);
        requireConfigured();

        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amountPaise);
        payload.put("currency", currency);
        payload.put("receipt", "startup-sub-" + startupId + "-" + System.currentTimeMillis());
        payload.put("payment_capture", 1);
        payload.put("notes", Map.of(
                "startupId", String.valueOf(startupId),
                "startupName", startup.getName(),
                "plan", "MONTHLY",
                "durationDays", durationDays
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

            startup.setSubscriptionActive(false);
            startup.setSubscriptionPlan("MONTHLY");
            startup.setSubscriptionOrderId(orderId);
            startup.setSubscriptionPaymentId(null);
            startup.setSubscriptionActivatedAt(null);
            startup.setSubscriptionExpiresAt(null);
            startupService.saveStartup(startup);

            Map<String, Object> result = new HashMap<>(order);
            result.put("keyId", razorpayKeyId);
            result.put("plan", "MONTHLY");
            result.put("durationDays", durationDays);
            result.put("amountPaise", amountPaise);
            result.put("currency", currency);
            return result;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to create Razorpay order", ex);
        }
    }

    public Map<String, Object> verifyAndActivate(Long startupId, String orderId, String paymentId, String signature) {
        requireConfigured();

        if (orderId == null || orderId.isBlank() || paymentId == null || paymentId.isBlank() || signature == null || signature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId, paymentId, and signature are required");
        }

        Startup startup = startupService.getStartupById(startupId);
        if (startup.getSubscriptionOrderId() != null && !startup.getSubscriptionOrderId().equals(orderId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment order does not match the current subscription order");
        }

        String expectedSignature = generateSignature(orderId, paymentId);
        if (!expectedSignature.equalsIgnoreCase(signature.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay signature");
        }

        Startup updated = startupService.activateSubscription(startupId, "MONTHLY", orderId, paymentId, durationDays);
        Map<String, Object> response = new HashMap<>();
        response.put("active", true);
        response.put("plan", updated.getSubscriptionPlan());
        response.put("activatedAt", updated.getSubscriptionActivatedAt());
        response.put("expiresAt", updated.getSubscriptionExpiresAt());
        response.put("orderId", updated.getSubscriptionOrderId());
        response.put("paymentId", updated.getSubscriptionPaymentId());
        response.put("expired", false);
        return response;
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