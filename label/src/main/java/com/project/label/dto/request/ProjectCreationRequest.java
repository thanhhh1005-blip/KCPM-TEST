package com.project.label.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class ProjectCreationRequest {
    private String name;
    private String description;
    private String managerId; // 🌟 THÊM TRƯỜNG NÀY ĐỂ NHẬN MANAGER TỪ ADMIN
    private String reviewerId;
    private List<LabelRequest> labels; // Danh sách các nhãn truyền lên

    @Data
    public static class LabelRequest {
        private String name;
        private String color;
    }
}
