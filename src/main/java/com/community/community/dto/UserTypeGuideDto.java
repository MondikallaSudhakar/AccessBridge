package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserTypeGuideDto {
    private String role;
    private String label;
    private String loginPurpose;
    private String dashboardPath;
    private List<String> canView;
    private List<String> canDo;
}