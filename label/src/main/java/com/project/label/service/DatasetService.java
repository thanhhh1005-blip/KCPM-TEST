package com.project.label.service;

import com.project.label.dto.response.DataItemResponse;
import com.project.label.entity.DataItem;
import com.project.label.entity.Project;
import com.project.label.enums.DataItemStatus;
import com.project.label.repository.IDataItemRepository;
import com.project.label.repository.IProjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatasetService {
    
    private final CloudinaryService cloudinaryService;
    private final IDataItemRepository dataItemRepository;
    private final IProjectRepository projectRepository;

    // Annotation này đảm bảo: Upload lỗi giữa chừng thì không lưu DB linh tinh
    @Transactional 
    public List<String> uploadAndSaveDataset(List<MultipartFile> files, String projectId) {
        
        Project currentProject = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + projectId));

        List<String> uploadedUrls = new ArrayList<>();
        
        try {
            for (MultipartFile file : files) {
                // 1. Upload lên Cloud
                String url = cloudinaryService.uploadImage(file);
                uploadedUrls.add(url);

                // 2. Lưu vào DB
                DataItem item = DataItem.builder()
                        .fileName(file.getOriginalFilename())
                        .fileUrl(url)
                        .status(DataItemStatus.UNLABELED)
                        .project(currentProject)
                        .build();
                dataItemRepository.save(item);
            }
            return uploadedUrls;
            
        } catch (Exception e) {
            // Ném lỗi ra để Spring Boot kích hoạt Rollback Database
            throw new RuntimeException("Lỗi trong quá trình xử lý ảnh: " + e.getMessage());
        }
    }
    public List<DataItemResponse> getDatasetByProject(String projectId) {
        // Tìm tất cả DataItem theo ID dự án
        List<DataItem> items = dataItemRepository.findByProjectId(projectId);
        
        // Chuyển đổi Entity sang DTO để trả về an toàn
        return items.stream().map(item -> 
            DataItemResponse.builder()
                .id(item.getId())
                .fileName(item.getFileName())
                .fileUrl(item.getFileUrl())
                .status(item.getStatus())
                .build()
        ).collect(Collectors.toList());
    }
}