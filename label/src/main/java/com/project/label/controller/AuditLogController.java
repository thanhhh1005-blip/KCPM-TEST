package com.project.label.controller;

import com.project.label.dto.response.ApiResponse;
import com.project.label.entity.AuditLog;
import com.project.label.repository.IAuditLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/audit-logs")  
@RequiredArgsConstructor
public class AuditLogController {

    private final IAuditLogRepository auditLogRepository;

    // Chỉ ADMIN mới được gọi API này (Bạn có thể cấu hình trong SecurityConfig sau)
    @GetMapping
    public ApiResponse<List<AuditLog>> getAllLogs() {
        List<AuditLog> logs = auditLogRepository.findAllByOrderByTimestampDesc();
        return ApiResponse.<List<AuditLog>>builder().result(logs).build();
    }
}