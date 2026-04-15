package com.project.label.service;

import com.project.label.dto.request.AnnotationRequest;
import com.project.label.entity.Annotation;
import com.project.label.entity.Task;
import com.project.label.repository.IAnnotationRepository;
import com.project.label.repository.ITaskRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AnnotationService {
    IAnnotationRepository annotationRepository;
    ITaskRepository taskRepository;

    @Transactional
    public void saveAll(AnnotationRequest request) {
        // 1. Tìm Task tương ứng
        Task task = taskRepository.findById(request.getTaskId())
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Task"));

        // 2. Xóa các nhãn cũ của Task này (nếu có) để cập nhật mới
        annotationRepository.deleteByTaskId(request.getTaskId());

        // 3. Chuyển đổi từ DTO sang Entity và lưu
        List<Annotation> annotations = request.getAnnotations().stream()
                .map(detail -> Annotation.builder()
                        .labelId(detail.getLabelId())
                        .yCenter(detail.getYcenter())
                        .width(detail.getWidth())
                        .height(detail.getHeight())
                        .task(task)
                        .build())
                .collect(Collectors.toList());

        annotationRepository.saveAll(annotations);
    }
}