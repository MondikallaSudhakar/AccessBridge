package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String bio;
    private String disabilityType;
    private String skills;
    private String supportNeeds;
    private String profileImage;
}