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
@Table(name = "users")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String address;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 50)
    private Role role;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 120)
    private String disabilityType;

    @Column(columnDefinition = "TEXT")
    private String skills;

    @Column(columnDefinition = "TEXT")
    private String supportNeeds;

    @Column(length = 120)
    private String dependentName;

    @Column(length = 80)
    private String dependentRelation;

    @Column(length = 20)
    private String dependentAge;

    @Column(columnDefinition = "TEXT")
    private String dependentNeeds;

    private String profileImage;

    @Column(nullable = false)
    private Boolean active = true;

    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, APPROVED, REJECTED

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "donor", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Donation> donations = new ArrayList<>();

    @OneToMany(mappedBy = "organizer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Event> organizedEvents = new ArrayList<>();

    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Achievement> achievements = new ArrayList<>();
}
