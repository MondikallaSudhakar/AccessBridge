package com.community.community.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "therapy_types")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyType {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String typeName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 120)
    private String ageGroup; // e.g., "0-5", "5-12", "13-18", "18+"

    @Column(length = 120)
    private String sessionDuration; // e.g., "30 minutes", "1 hour"

    @Column(length = 50)
    private String frequency; // e.g., "Weekly", "Bi-weekly", "Monthly"

    @Column
    private Double cost; // Cost per session

    @Column(columnDefinition = "TEXT")
    private String benefits;

    @Column(columnDefinition = "TEXT")
    private String prerequisites;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "therapy_center_id", nullable = false)
    private TherapyCenter therapyCenter;

    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, INACTIVE

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
