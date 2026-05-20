package com.project.label.controller;

import com.project.label.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    // Đổi tên API thành /{projectId} cho tổng quát
    @GetMapping("/{projectId}")
    public void exportDataset(
            @PathVariable String projectId,
            //  Hứng tham số format từ React (Mặc định là YOLO)
            @RequestParam(defaultValue = "YOLO") String format, 
            HttpServletResponse response) {
        try {
            // Đặt tên file tải về linh hoạt theo định dạng
            response.setContentType("application/zip");
            response.setHeader("Content-Disposition", "attachment; filename=\"dataset_" + projectId + "_" + format + ".zip\"");

            // Gọi Service và truyền thêm biến format
            exportService.exportDatasetFlexible(projectId, format, response);
            
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất file: " + e.getMessage());
        }
    }
}