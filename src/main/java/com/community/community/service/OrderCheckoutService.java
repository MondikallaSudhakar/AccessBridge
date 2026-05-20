package com.community.community.service;

import com.community.community.model.Order;
import com.community.community.model.User;
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
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class OrderCheckoutService {

    private static final URI ORDERS_URI = URI.create("https://api.razorpay.com/v1/orders");

    private final OrderService orderService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;

    @Value("${razorpay.key-id}")
    private String razorpayKeyId;

    @Value("${razorpay.key-secret}")
    private String razorpayKeySecret;

    @Value("${razorpay.currency:INR}")
    private String currency;

    public Map<String, Object> createPaymentOrder(Long userId, List<Map<String, Object>> cartItems) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found with id: " + userId));

        requireConfigured();

        BigDecimal totalAmount = calculateTotal(cartItems);
        int amountPaise = totalAmount.multiply(BigDecimal.valueOf(100)).setScale(0, RoundingMode.HALF_UP).intValueExact();

        Map<String, Object> payload = new HashMap<>();
        payload.put("amount", amountPaise);
        payload.put("currency", currency);
        payload.put("receipt", "order-" + userId + "-" + System.currentTimeMillis());
        payload.put("payment_capture", 1);
        payload.put("notes", Map.of(
                "userId", String.valueOf(userId),
                "userEmail", user.getEmail(),
                "itemCount", String.valueOf(cartItems == null ? 0 : cartItems.size())
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
            result.put("amount", totalAmount);
            result.put("currency", currency);
            result.put("userId", userId);
            return result;
        } catch (ResponseStatusException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Failed to create Razorpay order", ex);
        }
    }

    public Order verifyPaymentAndCreateOrder(Long userId, String orderId, String paymentId, String signature, List<Map<String, Object>> cartItems) {
        requireConfigured();

        if (orderId == null || orderId.isBlank() || paymentId == null || paymentId.isBlank() || signature == null || signature.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "orderId, paymentId, and signature are required");
        }

        String expectedSignature = generateSignature(orderId, paymentId);
        if (!expectedSignature.equalsIgnoreCase(signature.trim())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid Razorpay signature");
        }

        if (cartItems == null || cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cartItems are required");
        }

        return orderService.createOrder(userId, cartItems);
    }

    private BigDecimal calculateTotal(List<Map<String, Object>> cartItems) {
        if (cartItems == null || cartItems.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cartItems are required");
        }

        BigDecimal total = BigDecimal.ZERO;
        for (Map<String, Object> item : cartItems) {
            if (item == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cart item is missing");
            }

            Object priceValue = item.get("price");
            Object quantityValue = item.get("quantity");
            if (priceValue == null || quantityValue == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cart items must include price and quantity");
            }

            BigDecimal price = new BigDecimal(priceValue.toString());
            int quantity = Integer.parseInt(quantityValue.toString());
            if (quantity <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "cart item quantity must be greater than zero");
            }

            total = total.add(price.multiply(BigDecimal.valueOf(quantity)));
        }

        if (total.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Order total must be greater than zero");
        }

        return total;
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