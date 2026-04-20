package com.project.label.controller;

import com.project.label.dto.response.ApiResponse;
import com.project.label.entity.Label;
import com.project.label.repository.ILabelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/labels")
@RequiredArgsConstructor
public class LabelController {
    
    private final ILabelRepository labelRepository;

    @GetMapping("/project/{projectId}")
    public ApiResponse<List<Label>> getLabelsByProject(@PathVariable String projectId) {
      System.out.println("👉 ĐÃ VÀO ĐƯỢC API LẤY LABEL! Project ID là: " + projectId);
        List<Label> labels = labelRepository.findByProject_Id(projectId);
        return ApiResponse.<List<Label>>builder()
                .result(labels)
                .build();
    }
}