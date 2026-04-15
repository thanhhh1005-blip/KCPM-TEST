package com.project.label.dto.response;

import com.project.label.enums.ProjectStatus;
import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;

@Data
@Builder
public class ProjectResponse {
    private String id;
    private String name;
    private String description;
    private ProjectStatus status;
    private int labelCount; // Số lượng nhãn
    private int dataItemCount; // Số lượng ảnh
    private LocalDateTime createdAt;
}