package com.community.community.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "school_partnerships")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolPartnership {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String partnerName; // NGO name, company name, or other school name

    @Column(nullable = false)
    private String partnerEmail;

    @Column(length = 20)
    private String partnerPhone;

    // JOB_PLACEMENT, TRAINING_SUPPORT, MENTORSHIP, DONATION, RESEARCH, SKILL_DEVELOPMENT
    @Column(nullable = false)
    private String partnershipType;

    @Column(columnDefinition = "TEXT")
    private String partnershipDetails;

    @Column(nullable = false)
    private LocalDate startDate;

    private LocalDate endDate;

    // ACTIVE, PENDING, INACTIVE, COMPLETED, CANCELLED
    @Column(nullable = false)
    private String status = "PENDING";

    @Column(columnDefinition = "TEXT")
    private String agreementUrl;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
