package com.project.label.enums;

public enum TaskStatus {
    TODO,           // Mới giao cho Annotator
    IN_PROGRESS,    // Annotator đang tiến hành gán nhãn
    SUBMITTED,      // Annotator đã nộp, chờ Reviewer vào duyệt
    APPROVED,       // Reviewer đã duyệt (Hoàn thành)
    REJECTED        // Reviewer từ chối, yêu cầu Annotator làm lại
}