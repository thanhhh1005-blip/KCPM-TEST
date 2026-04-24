package com.project.label.controller;

import com.project.label.dto.response.ApiResponse;
import com.project.label.entity.SystemConfig;
import com.project.label.repository.ISystemConfigRepository;
import com.project.label.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/settings")
@RequiredArgsConstructor
public class SystemConfigController {

    private final ISystemConfigRepository systemConfigRepository;
    private final AuditLogService auditLogService;

    // Lấy toàn bộ cấu hình
    @GetMapping
    public ApiResponse<List<SystemConfig>> getAllConfigs() {
        return ApiResponse.<List<SystemConfig>>builder()
                .result(systemConfigRepository.findAll())
                .build();
    }

    // Cập nhật một cấu hình
    @PutMapping("/{key}")
    public ApiResponse<SystemConfig> updateConfig(@PathVariable String key, @RequestBody String newValue) {
        SystemConfig config = systemConfigRepository.findById(key)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy cấu hình: " + key));
        
        String oldValue = config.getValue();
        config.setValue(newValue);
        SystemConfig updatedConfig = systemConfigRepository.save(config);

        // 🌟 Ghi log lại luôn: Admin nào vừa đổi cấu hình?
        auditLogService.logAction("UPDATE", "SYSTEM_CONFIG", 
            "Đổi " + key + " từ [" + oldValue + "] sang [" + newValue + "]", "SUCCESS");

        return ApiResponse.<SystemConfig>builder().result(updatedConfig).build();
    }
}