package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TherapyTypeResponse {
    private Long id;
    private String typeName;
    private String description;
    private String ageGroup;
    private String sessionDuration;
    private String frequency;
    private Double cost;
    private String benefits;
    private String prerequisites;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
