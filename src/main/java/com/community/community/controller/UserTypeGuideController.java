package com.community.community.controller;

import com.community.community.dto.UserTypeGuideDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/meta")
public class UserTypeGuideController {

    @GetMapping("/user-types")
    public ResponseEntity<List<UserTypeGuideDto>> getUserTypes() {
        return ResponseEntity.ok(List.of(
                new UserTypeGuideDto(
                        "USER",
                        "Member / Donor",
                        "Join to discover verified schools, NGOs, and startups, then support the ones that match your interests.",
                        "/dashboard",
                        List.of(
                                "Public directory of schools, NGOs, startups, products, and search results",
                                "Verified organization profiles with needs, jobs, achievements, services, and marketplace items",
                                "Your messages, donation activity, and community updates"
                        ),
                        List.of(
                                "Browse and search the community directory",
                                "Open organization profiles and review public requests",
                                "Send messages and make donations",
                                "Track impact from the community feed"
                        )
                ),
                new UserTypeGuideDto(
                        "SPECIAL_ABLED_PERSON",
                        "Specially Abled Person",
                        "Join to gain independence through jobs, learning, income, support, and community access.",
                        "/special/profile",
                        List.of(
                                "Disability-friendly job listings and text/audio application support",
                                "Marketplace products and nearby NGO services",
                                "Special schools, training programs, events, campaigns, and govt schemes"
                        ),
                        List.of(
                                "Create a profile with skills, disability type, and support needs",
                                "Apply for jobs with text or audio support",
                                "Request NGO help and enroll in training",
                                "Register for events and save opportunities"
                        )
                ),
                new UserTypeGuideDto(
                        "GUARDIAN_CAREGIVER",
                        "Guardian / Caregiver",
                        "Join to support and manage opportunities for a dependent person through jobs, care, learning, and support services.",
                        "/guardian/profile",
                        List.of(
                                "Suitable jobs for dependent persons, special schools, therapy centers, NGOs, and support services",
                                "Learning resources, events, awareness programs, and future progress tracking",
                                "Dependent profile details used to personalize support opportunities"
                        ),
                        List.of(
                                "Create and manage a dependent profile",
                                "Apply for jobs on behalf of the dependent",
                                "Enroll in schools or training, request NGO support, and book therapy or training",
                                "Save and track opportunities for later follow-up"
                        )
                ),
                new UserTypeGuideDto(
                        "SCHOOL_ADMIN",
                        "School Admin",
                        "Join to publish school needs, show achievements, and attract supporters for your institution.",
                        "/school/profile",
                        List.of(
                                "School profile and public school directory",
                                "Needs, achievements, and support requests for schools",
                                "Messages and engagement related to the school profile"
                        ),
                        List.of(
                                "Create and update the school profile",
                                "Post needs and close completed requests",
                                "Publish achievements and media",
                                "Review donor interest and incoming messages"
                        )
                ),
                new UserTypeGuideDto(
                        "NGO_ADMIN",
                        "NGO Admin",
                        "Join to run campaigns, recruit support, publish services, and coordinate community response.",
                        "/ngo/profile",
                        List.of(
                                "NGO profile, NGO directory, and public directory search",
                                "Needs, jobs, products, services, and achievements linked to the NGO",
                                "Incoming messages from donors and community members"
                        ),
                        List.of(
                                "Create and update the NGO profile",
                                "Post needs, jobs, products, services, and achievements",
                                "Close or update open community requests",
                                "Reply to messages and manage community engagement"
                        )
                ),
                new UserTypeGuideDto(
                        "STARTUP_ADMIN",
                        "Startup Admin",
                        "Join to showcase social-impact products, manage inventory, and reach buyers and partners.",
                        "/startup/profile",
                        List.of(
                                "Startup profile, verified startup directory, and marketplace listings",
                                "Public product catalog and organization details",
                                "Community search and directory visibility"
                        ),
                        List.of(
                                "Create and update the startup profile",
                                "List and manage products",
                                "Update stock and availability",
                                "Promote impact-led products through the marketplace"
                        )
                ),
                new UserTypeGuideDto(
                        "SUPER_ADMIN",
                        "Super Admin",
                        "Join to review applications, approve organizations, and moderate the full platform.",
                        "/admin/approvals",
                        List.of(
                                "Pending approvals and all organization records",
                                "Platform-wide moderation queues and user status",
                                "Every public and protected management area"
                        ),
                        List.of(
                                "Approve or reject pending registrations",
                                "Verify schools, NGOs, and startups",
                                "Moderate records and oversee platform integrity"
                        )
                )
        ));
    }
}