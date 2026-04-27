package com.community.community.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class JobApplication {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private NGOJob job;

    // Applicant details
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;

    @Column(columnDefinition = "TEXT")
    private String coverLetter;

    @Column(columnDefinition = "TEXT")
    private String resumeText;       // plain-text resume

    private String audioNoteFileName; // uploaded audio note file name (optional)

    private String disabilityType;    // optional, for inclusive hiring context

    // Status: PENDING, SHORTLISTED, REJECTED, HIRED
    @Column(nullable = false)
    private String status = "PENDING";

    private String ngoReviewNote;     // NGO admin note when reviewing

    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    private LocalDateTime appliedAt;
}
