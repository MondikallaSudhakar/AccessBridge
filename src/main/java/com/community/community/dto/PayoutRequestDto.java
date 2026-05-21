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
    private Long startupId;
    private BigDecimal amount;
    private PayoutRequest.Status status;
    private String notes;
    private LocalDateTime createdAt;

    public static PayoutRequestDto fromEntity(PayoutRequest e) {
        Long ngoId = e.getNgo() != null ? e.getNgo().getId() : null;
        Long startupId = e.getStartup() != null ? e.getStartup().getId() : null;
        return new PayoutRequestDto(e.getId(), ngoId, startupId, e.getAmount(), e.getStatus(), e.getNotes(), e.getCreatedAt());
    }
}
