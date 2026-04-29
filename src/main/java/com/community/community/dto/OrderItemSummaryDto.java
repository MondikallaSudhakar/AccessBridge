package com.community.community.dto;

import java.math.BigDecimal;

public record OrderItemSummaryDto(
        Long productId,
        String productName,
        String source,
        Long sourceId,
        Integer quantity,
        BigDecimal price,
        BigDecimal totalPrice
) {}