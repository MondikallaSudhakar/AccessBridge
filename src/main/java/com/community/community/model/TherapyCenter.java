package com.community.community.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "therapy_centers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyCenter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 120)
    private String registrationNumber; // License/Registration number

    @Column(columnDefinition = "TEXT")
    private String therapistsInfo; // Info about therapists/staff

    @Column
    private Integer capacity; // Number of clients

    @Column(columnDefinition = "TEXT")
    private String operatingHours;

    @Column(columnDefinition = "TEXT")
    private String facilities; // Available facilities

    @Column(length = 120)
    private String specialization; // e.g., "Speech Therapy", "Physical Therapy", "Mental Health"

    private String profileImage;

    @Column(length = 120)
    private String website;

    @OneToMany(mappedBy = "therapyCenter", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    private List<TherapyType> therapyTypes = new ArrayList<>();

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED, ACTIVE

    @Column(nullable = false)
    private Boolean active = true;

    @Column(length = 50)
    private String adminId; // User ID of the admin managing this center

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
