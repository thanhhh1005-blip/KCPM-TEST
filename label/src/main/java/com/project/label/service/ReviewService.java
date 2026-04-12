package com.project.label.service;

import com.project.label.entity.ReviewLog;
import com.project.label.entity.Task;
import com.project.label.entity.User;
import com.project.label.enums.TaskStatus;
import com.project.label.repository.IReviewLogRepository;
import com.project.label.repository.ITaskRepository;
import com.project.label.repository.IUserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {

    private final ITaskRepository taskRepository;
    private final IReviewLogRepository reviewLogRepository;
    private final IUserRepository userRepository; // Dùng lại IUserRepository bạn đã có sẵn

    public List<Task> getPendingTasks(String reviewerId) {
        return taskRepository.findByReviewerIdAndStatus(reviewerId, TaskStatus.SUBMITTED);
    }

    @Transactional
    public Task approveTask(String taskId) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ này."));

        if (task.getStatus() != TaskStatus.SUBMITTED) {
            throw new IllegalStateException("Lỗi: Chỉ có thể duyệt các ảnh đang ở trạng thái SUBMITTED.");
        }

        task.setStatus(TaskStatus.APPROVED);
        return taskRepository.save(task);
    }

    @Transactional
    public Task rejectTask(String taskId, String reviewerId, String rejectReason) {
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy nhiệm vụ."));

        User reviewer = userRepository.findById(reviewerId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Reviewer."));

        if (task.getStatus() != TaskStatus.SUBMITTED) {
            throw new IllegalStateException("Lỗi: Chỉ có thể từ chối các ảnh đang ở trạng thái SUBMITTED.");
        }

        // 1. Đổi trạng thái Task về REJECTED
        task.setStatus(TaskStatus.REJECTED);
        Task savedTask = taskRepository.save(task);

        // 2. Ghi lại lịch sử (ReviewLog) để Annotator biết đường sửa
        ReviewLog log = ReviewLog.builder()
                .task(savedTask)
                .reviewer(reviewer)
                .comment(rejectReason)
                .build();
        reviewLogRepository.save(log);

        return savedTask;
    }
}