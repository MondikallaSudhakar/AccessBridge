package com.community.community.service;

import com.community.community.model.NGO;
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
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class RazorpaySubscriptionService {

    private static final URI ORDERS_URI = URI.create("https://api.razorpay.com/v1/orders");

    private final NGOService ngoService;
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

    public Map<String, Object> createOrder(Long ngoId) {
        NGO ngo = ngoService.getNGOById(ngoId);
        requireConfigured();

        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amountPaise);
        payload.put("currency", currency);
        payload.put("receipt", "ngo-sub-" + ngoId + "-" + System.currentTimeMillis());
        payload.put("payment_capture", 1);
        payload.put("notes", Map.of(
                "ngoId", String.valueOf(ngoId),
                "ngoName", ngo.getName(),
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

            ngo.setSubscriptionActive(false);
            ngo.setSubscriptionPlan("MONTHLY");
            ngo.setSubscriptionOrderId(orderId);
            ngo.setSubscriptionPaymentId(null);
            ngo.setSubscriptionActivatedAt(null);
            ngo.setSubscriptionExpiresAt(null);
            ngoService.saveNGO(ngo);

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

    public Map<String, Object> verifyAndActivate(Long ngoId, String orderId, String paymentId, String signature) {
        requireConfigured();

        if (orderId == null || orderId.isBlank() || paymentId == null || paymentId.isBlank() || signature == null || signature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId, paymentId, and signature are required");
        }

        NGO ngo = ngoService.getNGOById(ngoId);
        if (ngo.getSubscriptionOrderId() != null && !ngo.getSubscriptionOrderId().equals(orderId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Payment order does not match the current subscription order");
        }

        String expectedSignature = generateSignature(orderId, paymentId);
        if (!expectedSignature.equalsIgnoreCase(signature.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay signature");
        }

        NGO updated = ngoService.activateSubscription(ngoId, "MONTHLY", orderId, paymentId, durationDays);
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