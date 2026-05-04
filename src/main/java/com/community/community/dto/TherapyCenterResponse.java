package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyCenterResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private String bio;
    private String description;
    private String registrationNumber;
    private String therapistsInfo;
    private Integer capacity;
    private String operatingHours;
    private String facilities;
    private String specialization;
    private String profileImage;
    private String website;
    private String status;
    private Boolean active;
    private String adminId;
    private List<TherapyTypeResponse> therapyTypes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
