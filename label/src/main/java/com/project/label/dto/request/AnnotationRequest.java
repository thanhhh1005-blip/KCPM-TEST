package com.project.label.dto.request;

import lombok.*;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AnnotationRequest {
    private String taskId;
    private List<AnnotationDetail> annotations;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AnnotationDetail {
        private int labelId;
        private double xcenter;
        private double ycenter;
        private double width;
        private double height;
    }
}