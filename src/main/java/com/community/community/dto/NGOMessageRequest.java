package com.community.community.dto;

import lombok.Data;

@Data
public class NGOMessageRequest {
    private String content;
    private String recipientEmail;
}
