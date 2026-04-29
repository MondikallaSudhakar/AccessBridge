package com.community.community.controller;

import com.community.community.dto.AdminStatsDTO;
import com.community.community.model.User;
import com.community.community.model.Role;
import com.community.community.service.UserService;
import com.community.community.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('SUPER_ADMIN')")
public class AdminController {

    private final UserService userService;
    private final UserRepository userRepository;
    private final SchoolRepository schoolRepository;
    private final NGORepository ngoRepository;
    private final StartupRepository startupRepository;
    private final CourseRepository courseRepository;
    private final ProductRepository productRepository;
    private final NGOJobRepository ngoJobRepository;
    private final EventRepository eventRepository;
    private final DonationRepository donationRepository;
    private final EnrollmentRepository enrollmentRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EventApplicationRepository eventApplicationRepository;
    private final CertificationRepository certificationRepository;

    @GetMapping("/pending")
    public ResponseEntity<List<User>> getPendingUsers() {
        return ResponseEntity.ok(userService.getPendingUsers());
    }

    @PostMapping("/approve/{id}")
    public ResponseEntity<User> approveUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.approveUser(id));
    }

    @PostMapping("/reject/{id}")
    public ResponseEntity<User> rejectUser(@PathVariable Long id) {
        return ResponseEntity.ok(userService.rejectUser(id));
    }

    @GetMapping("/stats")
    public ResponseEntity<AdminStatsDTO> getAdminStats() {
        AdminStatsDTO stats = AdminStatsDTO.builder()
                // User counts by role
                .totalUsers(userRepository.count())
                .totalSchools(schoolRepository.count())
                .totalNGOs(ngoRepository.count())
                .totalStartups(startupRepository.count())
                .totalVolunteers(userRepository.countByRole(Role.VOLUNTEER))
                .totalSpecialAbled(userRepository.countByRole(Role.SPECIAL_ABLED_PERSON))
                .totalGuardians(userRepository.countByRole(Role.GUARDIAN_CAREGIVER))
                
                // Approval stats
                .pendingApprovals((long) userService.getPendingUsers().size())
                .approvedOrganizations(userRepository.countByRoleAndStatus(Role.SCHOOL_ADMIN, "APPROVED") + 
                                      userRepository.countByRoleAndStatus(Role.NGO_ADMIN, "APPROVED") + 
                                      userRepository.countByRoleAndStatus(Role.STARTUP_ADMIN, "APPROVED"))
                .rejectedApplications(userRepository.countByStatus("REJECTED"))
                
                // Content stats
                .totalCourses(courseRepository.count())
                .totalProducts(productRepository.count())
                .totalJobs(ngoJobRepository.count())
                .totalEvents(eventRepository.count())
                .totalDonations(donationRepository.count())
                
                // Engagement stats
                .totalEnrollments(enrollmentRepository.count())
                .totalJobApplications(jobApplicationRepository.count())
                .totalEventApplications(eventApplicationRepository.count())
                .totalCertifications(certificationRepository.count())
                
                // Platform stats
                .totalActiveOrganizations(schoolRepository.count() + ngoRepository.count() + startupRepository.count())
                .totalApprovedUsers(userRepository.countByStatus("APPROVED"))
                .build();

        return ResponseEntity.ok(stats);
    }
}
