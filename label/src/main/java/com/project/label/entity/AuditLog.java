package com.project.label.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Ai là người thực hiện?
    private String username;

    // Hành động là gì? (Ví dụ: CREATE, UPDATE, DELETE)
    private String action;

    // Tác động lên cái gì? (Ví dụ: PROJECT, USER, DATA_ITEM)
    private String targetEntity;

    // Chi tiết hành động (Ví dụ: "Đã xóa dự án ABC")
    private String details;

    private String ipAddress; // Lưu IP của người thao tác
    private String status;
    
    // Thời gian thực hiện (Tự động lấy giờ hệ thống)
    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime timestamp;
}