package com.project.label.controller;

import com.project.label.dto.request.RejectTaskRequest;
import com.project.label.entity.Task;
import com.project.label.service.ReviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/reviews")
@RequiredArgsConstructor
public class ReviewController {

    private final ReviewService reviewService;

    // GET: http://localhost:8080/api/v1/reviews/pending/1
    @GetMapping("/pending/{reviewerId}")
    public ResponseEntity<List<Task>> getPendingTasks(@PathVariable String reviewerId) {
        List<Task> tasks = reviewService.getPendingTasks(reviewerId);
        return ResponseEntity.ok(tasks);
    }

    // POST: http://localhost:8080/api/v1/reviews/100/approve
    @PostMapping("/{taskId}/approve")
    public ResponseEntity<String> approveTask(@PathVariable String taskId) {
        reviewService.approveTask(taskId);
        return ResponseEntity.ok("Đã phê duyệt nhiệm vụ thành công!");
    }

    // POST: http://localhost:8080/api/v1/reviews/100/reject
    @PostMapping("/{taskId}/reject")
    public ResponseEntity<String> rejectTask(
            @PathVariable String taskId, 
            @RequestBody RejectTaskRequest request) {
            
        reviewService.rejectTask(taskId, request.getReviewerId(), request.getRejectReason());
        return ResponseEntity.ok("Đã từ chối nhiệm vụ và gửi phản hồi cho Annotator.");
    }
}