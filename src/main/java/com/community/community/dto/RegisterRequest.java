package com.community.community.dto;

import com.community.community.model.Role;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {
    // Common user fields
    private String name;
    private String email;
    private String password;
    private String phone;
    private Role role;
    private String bio;

    // Organization fields (shared by School, NGO, Startup)
    private String orgName;        // Organization name
    private String orgAddress;
    private String orgCity;
    private String orgState;
    private String orgCountry;
    private String orgDescription;
    private String orgWebsiteUrl;
    private String orgLogoUrl;

    // NGO-specific
    private String orgMission;
    private String orgRegistrationNumber;

    // Startup-specific
    private String orgIndustry;
}
