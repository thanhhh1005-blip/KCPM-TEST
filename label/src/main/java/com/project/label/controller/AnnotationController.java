package com.project.label.controller;

import com.project.label.dto.request.AnnotationRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.entity.Annotation;
import com.project.label.repository.IAnnotationRepository;
import com.project.label.service.AnnotationService;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/annotations")
public class AnnotationController {

    @Autowired
    private AnnotationService annotationService;

    @Autowired
    private IAnnotationRepository annotationRepository;

    @PostMapping
    public ApiResponse<String> save(@RequestBody AnnotationRequest request) {
        
        annotationService.saveAll(request);

        return ApiResponse.<String>builder()
                .result("Gán nhãn thành công và đã lưu vào Database!")
                .build();
    }
    @GetMapping("/item/{itemId}")
    public ApiResponse<List<Annotation>> getByItem(@PathVariable String itemId) {
        return ApiResponse.<List<Annotation>>builder()
                .result(annotationRepository.findByDataItemId(itemId)) // Đảm bảo Repo đã có hàm này
                .build();
}
}