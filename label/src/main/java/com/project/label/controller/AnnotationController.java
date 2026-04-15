package com.project.label.controller;

import com.project.label.dto.request.AnnotationRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.entity.Annotation;
import com.project.label.entity.Task;
import com.project.label.repository.IAnnotationRepository; 

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/annotations")
@CrossOrigin(origins = "http://localhost:5173")
public class AnnotationController {

    @Autowired
    private IAnnotationRepository annotationRepository;

    @PostMapping
    @Transactional // Bắt buộc có để lưu vào DB
    public ApiResponse<String> save(@RequestBody AnnotationRequest request) {
        
        System.out.println("Nhận dữ liệu gán nhãn cho Task ID: " + request.getTaskId());

        // 1. Tạo một đối tượng Task "trống" và chỉ gán ID vào để làm khóa ngoại (Foreign Key)
        Task taskReference = new Task();
        // LƯU Ý: Nếu Task ID của bạn kiểu String thì giữ nguyên, nếu kiểu Long thì thêm Long.valueOf()
        taskReference.setId(String.valueOf(request.getTaskId())); 

        // 2. Vòng lặp lưu từng nhãn
        request.getAnnotations().forEach(a -> {
            Annotation entity = new Annotation();
            
            // Liên kết nhãn này với Task tương ứng
            entity.setTask(taskReference);
            
            // Gán Label ID
            entity.setLabelId(a.getLabelId());
            
            // Gán 4 tọa độ YOLO riêng biệt đúng theo Entity của bạn
            entity.setXCenter(a.getXcenter()); // Nếu a.getXcenter() báo đỏ thì sửa thành a.getXCenter() nhé
            entity.setYCenter(a.getYcenter());
            entity.setWidth(a.getWidth());
            entity.setHeight(a.getHeight());
            
            // 3. Đẩy xuống Database
            annotationRepository.save(entity);
        });

        return ApiResponse.<String>builder()
                .result("Gán nhãn thành công và đã lưu vào MySQL!")
                .build();
    }
}