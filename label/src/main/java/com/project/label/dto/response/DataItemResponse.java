package com.project.label.dto.response;

import com.project.label.enums.DataItemStatus;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class DataItemResponse {
    private String id;
    private String fileName;
    private String fileUrl;
    private DataItemStatus status;
}
