package com.project.label.repository;

import com.project.label.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAuditLogRepository extends JpaRepository<AuditLog, String> {
    // Lấy danh sách log và sắp xếp mới nhất lên đầu
    List<AuditLog> findAllByOrderByTimestampDesc();
}