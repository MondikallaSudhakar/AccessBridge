package com.community.community.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class NGOMessageResponse {
    private Long id;
    private Long ngoId;
    private Long senderId;
    private String senderName;
    private String senderEmail;
    private Long recipientId;
    private String recipientEmail;
    private String senderRole;
    private String content;
    private LocalDateTime createdAt;
}
