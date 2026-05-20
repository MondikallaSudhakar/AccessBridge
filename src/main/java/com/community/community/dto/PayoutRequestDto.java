package com.community.community.dto;

import com.community.community.model.PayoutRequest;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayoutRequestDto {
    private Long id;
    private Long ngoId;
    private BigDecimal amount;
    private PayoutRequest.Status status;
    private String notes;
    private LocalDateTime createdAt;

    public static PayoutRequestDto fromEntity(PayoutRequest e) {
        return new PayoutRequestDto(e.getId(), e.getNgo().getId(), e.getAmount(), e.getStatus(), e.getNotes(), e.getCreatedAt());
    }
}
