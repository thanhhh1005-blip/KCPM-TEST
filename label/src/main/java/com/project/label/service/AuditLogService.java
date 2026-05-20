package com.project.label.service;

import com.project.label.entity.AuditLog;
import com.project.label.repository.IAuditLogRepository;

import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Service
@RequiredArgsConstructor
public class AuditLogService {

    private final IAuditLogRepository auditLogRepository;

    // Hàm này dùng để các Service khác gọi ké vào khi có hành động
    public void logAction(String action, String targetEntity, String details, String status) {
        try {
            String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
            
            //  Tự động lấy IP của người dùng
            HttpServletRequest request = ((ServletRequestAttributes) RequestContextHolder.currentRequestAttributes()).getRequest();
            String ipAddress = request.getRemoteAddr();

            AuditLog log = AuditLog.builder()
                    .username(currentUsername)
                    .action(action)
                    .targetEntity(targetEntity)
                    .details(details)
                    .ipAddress(ipAddress) // Ghi IP
                    .status(status)       // Ghi Trạng thái
                    .build();

            auditLogRepository.save(log);
        } catch (Exception e) {
            System.err.println("Lỗi khi ghi log: " + e.getMessage());
        }
    }
}