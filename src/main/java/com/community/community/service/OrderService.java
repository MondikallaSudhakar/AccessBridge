package com.community.community.service;

import com.community.community.dto.OrderItemSummaryDto;
import com.community.community.dto.OrderSummaryDto;
import com.community.community.model.Order;
import com.community.community.model.OrderItem;
import com.community.community.model.User;
import com.community.community.repository.OrderRepository;
import com.community.community.repository.OrderItemRepository;
import com.community.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional
public class OrderService {

    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final UserRepository userRepository;
    private final ProductService productService;
    private final NGOProductService ngoProductService;

    public Order createOrder(Long userId, List<Map<String, Object>> cartItems) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        Order order = new Order();
        order.setUser(user);
        order.setStatus(Order.OrderStatus.PENDING);
        
        BigDecimal totalPrice = BigDecimal.ZERO;
        order = orderRepository.save(order);
        
        for (Map<String, Object> item : cartItems) {
            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProductId(Long.valueOf(item.get("productId").toString()));
            orderItem.setProductName(item.get("productName").toString());
            orderItem.setSource(item.get("source").toString());
            orderItem.setSourceId(Long.valueOf(item.get("sourceId").toString()));
            orderItem.setQuantity(Integer.parseInt(item.get("quantity").toString()));
            orderItem.setPrice(new BigDecimal(item.get("price").toString()));
            orderItem.setTotalPrice(orderItem.getPrice().multiply(new BigDecimal(orderItem.getQuantity())));
            
            orderItemRepository.save(orderItem);
            totalPrice = totalPrice.add(orderItem.getTotalPrice());
            
            // Reduce stock based on source
            if ("STARTUP".equals(item.get("source"))) {
                productService.updateStock(Long.valueOf(item.get("productId").toString()), 
                    -Integer.parseInt(item.get("quantity").toString()));
            } else if ("NGO".equals(item.get("source"))) {
                ngoProductService.reduceStock(Long.valueOf(item.get("productId").toString()), 
                    Integer.parseInt(item.get("quantity").toString()));
            }
        }
        
        order.setTotalPrice(totalPrice);
        return orderRepository.save(order);
    }

    @Transactional(readOnly = true)
    public Order getOrderById(Long orderId) {
        return orderRepository.findById(orderId)
                .orElseThrow(() -> new RuntimeException("Order not found with id: " + orderId));
    }

    @Transactional(readOnly = true)
    public List<Order> getUserOrders(Long userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    @Transactional(readOnly = true)
    public List<OrderItem> getOrderItems(Long orderId) {
        return orderItemRepository.findByOrderId(orderId);
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryDto> getOrdersForNGO(Long ngoId) {
        return buildOrderSummaries(orderItemRepository.findBySourceAndSourceId("NGO", ngoId));
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryDto> getOrdersForStartup(Long startupId) {
        return buildOrderSummaries(orderItemRepository.findBySourceAndSourceId("STARTUP", startupId));
    }

    public Order updateOrderStatus(Long orderId, Order.OrderStatus status) {
        Order order = getOrderById(orderId);
        order.setStatus(status);
        return orderRepository.save(order);
    }

    public void cancelOrder(Long orderId) {
        Order order = getOrderById(orderId);
        if (order.getStatus() != Order.OrderStatus.PENDING) {
            throw new RuntimeException("Only pending orders can be cancelled");
        }
        
        // Restore stock
        List<OrderItem> items = getOrderItems(orderId);
        for (OrderItem item : items) {
            if ("STARTUP".equals(item.getSource())) {
                productService.updateStock(item.getProductId(), item.getQuantity());
            } else if ("NGO".equals(item.getSource())) {
                ngoProductService.increaseStock(item.getProductId(), item.getQuantity());
            }
        }
        
        order.setStatus(Order.OrderStatus.CANCELLED);
        orderRepository.save(order);
    }

    private List<OrderSummaryDto> buildOrderSummaries(List<OrderItem> orderItems) {
        Map<Long, List<OrderItem>> grouped = new LinkedHashMap<>();
        for (OrderItem item : orderItems) {
            Long orderId = item.getOrder().getId();
            grouped.computeIfAbsent(orderId, key -> new ArrayList<>()).add(item);
        }

        return grouped.entrySet().stream()
                .map(entry -> {
                    List<OrderItem> items = entry.getValue();
                    Order order = items.get(0).getOrder();
                    BigDecimal sourceTotal = items.stream()
                            .map(OrderItem::getTotalPrice)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    List<OrderItemSummaryDto> itemDtos = items.stream()
                            .sorted(Comparator.comparing(OrderItem::getCreatedAt))
                            .map(item -> new OrderItemSummaryDto(
                                    item.getProductId(),
                                    item.getProductName(),
                                    item.getSource(),
                                    item.getSourceId(),
                                    item.getQuantity(),
                                    item.getPrice(),
                                    item.getTotalPrice()
                            ))
                            .toList();

                    String buyerName = order.getUser() != null ? order.getUser().getName() : null;
                    String buyerEmail = order.getUser() != null ? order.getUser().getEmail() : null;

                    return new OrderSummaryDto(
                            order.getId(),
                            order.getStatus(),
                            order.getTotalPrice(),
                            sourceTotal,
                            order.getCreatedAt(),
                            buyerName,
                            buyerEmail,
                            itemDtos
                    );
                })
                .sorted(Comparator.comparing(OrderSummaryDto::createdAt).reversed())
                .toList();
    }
}
