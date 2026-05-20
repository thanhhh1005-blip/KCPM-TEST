package com.project.label.dto.request;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationRequest {
    private String dataItemId; //  Đổi từ taskId sang dataItemId
    private List<AnnotationDetail> annotations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnotationDetail {
        private String labelId; //  Đổi từ int sang String để nối với bảng Label
        private double xcenter;
        private double ycenter;
        private double width;
        private double height;
    }
}