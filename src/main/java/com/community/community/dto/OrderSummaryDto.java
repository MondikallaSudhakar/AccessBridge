package com.community.community.dto;

import com.community.community.model.Order;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record OrderSummaryDto(
        Long orderId,
        Order.OrderStatus status,
        BigDecimal orderTotalPrice,
        BigDecimal sourceTotalPrice,
        LocalDateTime createdAt,
        String buyerName,
        String buyerEmail,
        String buyerAddress,
        List<OrderItemSummaryDto> items
) {}