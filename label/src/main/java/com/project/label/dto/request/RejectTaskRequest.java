package com.project.label.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RejectTaskRequest {
    private String rejectReason;
    private String reviewerId; // Cần ID của reviewer để biết ai là người bắt lỗi
}