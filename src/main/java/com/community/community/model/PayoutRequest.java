package com.community.community.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payout_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayoutRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id")
    private NGO ngo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_id")
    private Startup startup;

    @Column(precision = 14, scale = 2, nullable = false)
    private BigDecimal amount;

    @Column(length = 32, nullable = false)
    @Enumerated(EnumType.STRING)
    private Status status = Status.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public enum Status {
        PENDING,
        SENT,
        SETTLED,
        DECLINED,
        CANCELLED
    }
}
