package com.project.label.controller;

import com.project.label.dto.request.RejectTaskRequest; // Bạn tạo thêm DTO này nhé
import com.project.label.dto.response.ApiResponse;
import com.project.label.entity.DataItem;
import com.project.label.service.ReviewService;
import lombok.RequiredArgsConstructor;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/reviews") //  Bỏ v1, tự động nhận /api từ cấu hình global
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class ReviewController {

    private final ReviewService reviewService;

    @GetMapping("/pending/{projectId}")
    public ApiResponse<List<DataItem>> getPending(@PathVariable String projectId) {
        return ApiResponse.<List<DataItem>>builder()
                .result(reviewService.getPendingItems(projectId))
                .build();
    }

    @PostMapping("/{itemId}/approve")
    public ApiResponse<String> approve(@PathVariable String itemId) {
        reviewService.approve(itemId);
        return ApiResponse.<String>builder().result("Đã duyệt ảnh!").build();
    }

    @PostMapping("/{itemId}/reject")
    public ApiResponse<String> reject(@PathVariable String itemId, @RequestBody RejectTaskRequest request) {
        //  Tự động lấy username của người đang đăng nhập từ Token
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        
        // Gọi Service (truyền username thay vì reviewerId từ request)
        reviewService.reject(itemId, currentUsername, request.getRejectReason());
        
        return ApiResponse.<String>builder().result("Đã từ chối nhiệm vụ").build();
    }
}