package com.project.label.service;

import com.project.label.entity.*;
import com.project.label.enums.DataItemStatus;
import com.project.label.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ReviewService {
    private final IDataItemRepository dataItemRepository;
    private final IReviewLogRepository reviewLogRepository;
    private final IUserRepository userRepository;

    // Lấy những ảnh đã gán nhãn (LABELED) đang chờ Manager duyệt
    public List<DataItem> getPendingItems(String projectId) {
        return dataItemRepository.findByProjectIdAndStatus(projectId, DataItemStatus.LABELED);
    }

    @Transactional
    public void approve(String itemId) {
        DataItem item = dataItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        item.setStatus(DataItemStatus.APPROVED); // ✅ Duyệt!
        dataItemRepository.save(item);
    }

    @Transactional
    public void reject(String itemId, String username, String reason) {
        DataItem item = dataItemRepository.findById(itemId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));
        User reviewer = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Reviewer"));

        // 1. Đổi trạng thái về REJECTED để Annotator vẽ lại
        item.setStatus(DataItemStatus.REJECTED);
        dataItemRepository.save(item);

        // 2. Lưu lại "lời nhắn nhủ" của Manager
        ReviewLog log = ReviewLog.builder()
                .dataItem(item)
                .reviewer(reviewer)
                .comment(reason)
                .build();
        reviewLogRepository.save(log);
    }
}