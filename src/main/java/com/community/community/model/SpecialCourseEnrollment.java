package com.community.community.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "special_course_enrollments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class SpecialCourseEnrollment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long schoolId;

    @Column(nullable = false)
    private String schoolName;

    @Column(nullable = false)
    private Long courseId;

    @Column(nullable = false)
    private String courseTitle;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false)
    private String status = "PENDING";

    @Column(nullable = false)
    private String source = "special-training-page";

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime enrolledAt;
}
