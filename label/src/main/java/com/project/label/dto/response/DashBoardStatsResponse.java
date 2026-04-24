package com.project.label.dto.response;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashBoardStatsResponse {
  private long totalImages;
    private long approvedImages;
    private long pendingImages;
    private long rejectedImages;

    // Biểu đồ nhãn (Ví dụ: "Person": 450, "Cây": 120)
    private Map<String, Long> labelStats;
    private List<AnnotatorStatResponse> annotatorStats;

    @Data
    @Builder
    public static class AnnotatorStatResponse {
        private String name;
        private long done;
        private long rejected;
        private String errorRate;
    }
}
