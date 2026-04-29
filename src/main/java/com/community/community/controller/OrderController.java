package com.community.community.controller;

import com.community.community.model.Order;
import com.community.community.model.OrderItem;
import com.community.community.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> createOrder(@RequestParam Long userId, @RequestBody List<Map<String, Object>> cartItems) {
        Order order = orderService.createOrder(userId, cartItems);
        return ResponseEntity.status(HttpStatus.CREATED).body(order);
    }

    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> getOrder(@PathVariable Long orderId) {
        Order order = orderService.getOrderById(orderId);
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<Order>> getUserOrders(@PathVariable Long userId) {
        List<Order> orders = orderService.getUserOrders(userId);
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}/items")
    @PreAuthorize("hasAnyRole('USER', 'NGO_ADMIN', 'STARTUP_ADMIN', 'SCHOOL_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<OrderItem>> getOrderItems(@PathVariable Long orderId) {
        List<OrderItem> items = orderService.getOrderItems(orderId);
        return ResponseEntity.ok(items);
    }

    @GetMapping("/ngo/{ngoId}/orders")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<OrderItem>> getOrdersForNGO(@PathVariable Long ngoId) {
        List<OrderItem> orderItems = orderService.getOrdersForNGO(ngoId);
        return ResponseEntity.ok(orderItems);
    }

    @GetMapping("/startup/{startupId}/orders")
    @PreAuthorize("hasAnyRole('STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<List<OrderItem>> getOrdersForStartup(@PathVariable Long startupId) {
        List<OrderItem> orderItems = orderService.getOrdersForStartup(startupId);
        return ResponseEntity.ok(orderItems);
    }

    @PatchMapping("/{orderId}/status")
    @PreAuthorize("hasAnyRole('NGO_ADMIN', 'STARTUP_ADMIN', 'SUPER_ADMIN')")
    public ResponseEntity<Order> updateOrderStatus(@PathVariable Long orderId, @RequestBody Map<String, String> statusUpdate) {
        Order.OrderStatus status = Order.OrderStatus.valueOf(statusUpdate.get("status"));
        Order order = orderService.updateOrderStatus(orderId, status);
        return ResponseEntity.ok(order);
    }

    @DeleteMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('USER', 'SUPER_ADMIN')")
    public ResponseEntity<Void> cancelOrder(@PathVariable Long orderId) {
        orderService.cancelOrder(orderId);
        return ResponseEntity.noContent().build();
    }
}
