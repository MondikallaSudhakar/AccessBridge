package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyTypeRequest {
    private String typeName;
    private String description;
    private String ageGroup;
    private String sessionDuration;
    private String frequency;
    private Double cost;
    private String benefits;
    private String prerequisites;
}
