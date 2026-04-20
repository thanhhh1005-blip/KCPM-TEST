package com.project.label.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class RejectTaskRequest {
    private String rejectReason;
    private String reviewerId; // Cần ID của reviewer để biết ai là người bắt lỗi
}