package com.community.community.controller;

import com.community.community.dto.OrderSummaryDto;
import com.community.community.model.NGO;
import com.community.community.model.Order;
import com.community.community.model.OrderItem;
import com.community.community.model.Startup;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.NGORepository;
import com.community.community.repository.StartupRepository;
import com.community.community.repository.UserRepository;
import com.community.community.service.OrderService;
import com.community.community.service.OrderCheckoutService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final OrderCheckoutService orderCheckoutService;
    private final NGORepository ngoRepository;
    private final StartupRepository startupRepository;
    private final UserRepository userRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> createOrder(@RequestParam Long userId, @RequestBody List<Map<String, Object>> cartItems) {
        Order order = orderService.createOrder(userId, cartItems);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @PostMapping("/payment-order")
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Map<String, Object>> createPaymentOrder(@RequestParam Long userId, @RequestBody List<Map<String, Object>> cartItems) {
        return ResponseEntity.ok(orderCheckoutService.createPaymentOrder(userId, cartItems));
    }

    @PostMapping("/payment-verify")
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> verifyPaymentAndCreateOrder(@RequestParam Long userId, @RequestBody Map<String, Object> payload) {
        String orderId = payload == null ? null : (String) payload.get("orderId");
        String paymentId = payload == null ? null : (String) payload.get("paymentId");
        String signature = payload == null ? null : (String) payload.get("signature");
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> cartItems = payload == null ? List.of() : (List<Map<String, Object>>) payload.get("cartItems");

        Order order = orderCheckoutService.verifyPaymentAndCreateOrder(userId, orderId, paymentId, signature, cartItems);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}/items")
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable Long orderId) {
        List<OrderItem> items = orderService.getOrderItems(orderId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/ngo/{ngoId}/orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderSummaryDto>> getOrdersForNGO(@PathVariable Long ngoId) {
        if (!canAccessNgoOrders(ngoId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<OrderSummaryDto> orders = orderService.getOrdersForNGO(ngoId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/startup/{startupId}/orders")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<OrderSummaryDto>> getOrdersForStartup(@PathVariable Long startupId) {
        if (!canAccessStartupOrders(startupId)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        List<OrderSummaryDto> orders = orderService.getOrdersForStartup(startupId);
        return ResponseEntity.ok(orders);
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> statusUpdate) {
        Order.OrderStatus status = Order.OrderStatus.valueOf(statusUpdate.get("status"));
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'SPECIAL_ABLED_PERSON', 'SUPER_ADMIN')")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }

    private boolean canAccessNgoOrders(Long ngoId) {
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

        if (role != Role.NGO_ADMIN) {
            return false;
        }

        return ngoRepository.findById(ngoId)
                .map(ngo -> ngo.getEmail() != null && ngo.getEmail().equalsIgnoreCase(currentUser.get().getEmail()))
                .orElse(false);
    }

    private boolean canAccessStartupOrders(Long startupId) {
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
