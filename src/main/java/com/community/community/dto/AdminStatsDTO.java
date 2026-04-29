package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AdminStatsDTO {
    // User counts by role
    private Long totalUsers;
    private Long totalSchools;
    private Long totalNGOs;
    private Long totalStartups;
    private Long totalVolunteers;
    private Long totalSpecialAbled;
    private Long totalGuardians;
    
    // Approval stats
    private Long pendingApprovals;
    private Long approvedOrganizations;
    private Long rejectedApplications;
    
    // Content stats
    private Long totalCourses;
    private Long totalProducts;
    private Long totalJobs;
    private Long totalEvents;
    private Long totalDonations;
    
    // Engagement stats
    private Long totalEnrollments;
    private Long totalJobApplications;
    private Long totalEventApplications;
    private Long totalCertifications;
    
    // Platform stats
    private Double totalDonationAmount;
    private Long totalActiveOrganizations;
    private Long totalApprovedUsers;
}
