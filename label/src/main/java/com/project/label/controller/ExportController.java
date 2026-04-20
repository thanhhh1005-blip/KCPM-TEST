package com.project.label.controller;

import com.project.label.service.ExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/export")
@RequiredArgsConstructor
public class ExportController {

    private final ExportService exportService;

    @GetMapping("/yolo/{projectId}")
    public void exportYolo(@PathVariable String projectId, HttpServletResponse response) {
        try {
            exportService.exportYoloDataset(projectId, response);
        } catch (Exception e) {
            throw new RuntimeException("Lỗi khi xuất file: " + e.getMessage());
        }
    }
}