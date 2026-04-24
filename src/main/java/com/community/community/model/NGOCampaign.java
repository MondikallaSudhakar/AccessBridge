package com.community.community.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "ngo_campaigns")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NGOCampaign {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ngo_id", nullable = false)
    private NGO ngo;

    @Column(nullable = false, length = 180)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String objective;

    private LocalDate startDate;

    private LocalDate endDate;

    private Integer targetBeneficiaries;

    private Integer volunteerTarget;

    @Column(precision = 14, scale = 2)
    private BigDecimal spentAmount;

    @Column(nullable = false, length = 20)
    private String status = "PLANNED";

    @Column(columnDefinition = "TEXT")
    private String impactSummary;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
