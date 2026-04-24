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
@Table(name = "school_volunteers")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SchoolVolunteer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "school_id", nullable = false)
    private School school;

    @Column(nullable = false)
    private String volunteerName;

    @Column(nullable = false, unique = true)
    private String volunteerEmail;

    @Column(length = 20)
    private String volunteerPhone;

    @Column(columnDefinition = "TEXT")
    private String skills; // Comma-separated list

    // INSTRUCTOR, MENTOR, COUNSELOR, THERAPIST, COORDINATOR, OTHER
    @Column(nullable = false)
    private String role = "MENTOR";

    // Days/times available - can be comma-separated or JSON
    @Column(columnDefinition = "TEXT")
    private String availability;

    // ACTIVE, INACTIVE, ON_LEAVE
    @Column(nullable = false)
    private String status = "ACTIVE";

    private LocalDate joinDate;

    @Column(columnDefinition = "TEXT")
    private String bio;

    private String profileImageUrl;

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
