package com.project.label.service;

import com.project.label.dto.response.DataItemResponse;
import com.project.label.entity.DataItem;
import com.project.label.entity.Project;
import com.project.label.entity.ReviewLog;
import com.project.label.entity.SystemConfig;
import com.project.label.enums.DataItemStatus;
import com.project.label.enums.ProjectStatus;
import com.project.label.repository.IDataItemRepository;
import com.project.label.repository.IProjectRepository;
import com.project.label.repository.IReviewLogRepository;
import com.project.label.repository.ISystemConfigRepository;

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
  private final IReviewLogRepository reviewLogRepository;
  private final AuditLogService auditLogService;
  private final ISystemConfigRepository systemConfigRepository;

  // Annotation này đảm bảo: Upload lỗi giữa chừng thì không lưu DB linh tinh
  @Transactional
  public List<String> uploadAndSaveDataset(List<MultipartFile> files, String projectId) {

    Project currentProject = projectRepository.findById(projectId)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + projectId));
    SystemConfig sizeConfig = systemConfigRepository.findById("MAX_UPLOAD_SIZE_MB").orElse(null);
    long maxMb = (sizeConfig != null) ? Long.parseLong(sizeConfig.getValue()) : 5L;
    long maxBytes = maxMb * 1024 * 1024;
    List<String> uploadedUrls = new ArrayList<>();

    try {
      for (MultipartFile file : files) {
        if (file.getSize() > maxBytes) {
          throw new RuntimeException("CẢNH BÁO: File '" + file.getOriginalFilename() +
              "' quá nặng! Hệ thống chỉ cho phép tối đa " + maxMb + "MB.");
        }
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
        Project project = projectRepository.findById(projectId).orElseThrow();
        if (project.getStatus() == ProjectStatus.COMPLETED) {
          project.setStatus(ProjectStatus.IN_PROGRESS);
          projectRepository.save(project);
        }
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

    // Chuyển đổi Entity sang DTO và LẤY THÊM LÝ DO TỪ CHỐI (Nếu có)
    return items.stream().map(item -> {
      String reason = null;

      // 🌟 NẾU ẢNH BỊ TỪ CHỐI, MÓC LÝ DO TRONG LOG RA
      if (item.getStatus() == DataItemStatus.REJECTED) {
        List<ReviewLog> logs = reviewLogRepository.findByDataItemIdOrderByCreatedAtDesc(item.getId());
        if (!logs.isEmpty()) {
          reason = logs.get(0).getComment(); // Lấy lý do mới nhất
        }
      }

      return DataItemResponse.builder()
          .id(item.getId())
          .fileName(item.getFileName())
          .fileUrl(item.getFileUrl())
          .status(item.getStatus())
          .rejectReason(reason) // 🌟 Gắn lý do vào đây để gửi cho React
          .build();
    }).collect(Collectors.toList());
  }

  public DataItemResponse getNextItemForAnnotator(String projectId) {
    List<DataItemStatus> targetStatuses = java.util.Arrays.asList(
        DataItemStatus.UNLABELED,
        DataItemStatus.REJECTED);

    List<DataItem> items = dataItemRepository.findByProjectIdAndStatusIn(projectId, targetStatuses);

    if (items.isEmpty())
      return null;

    DataItem item = items.get(0);
    String reason = null;

    // 🌟 NẾU LÀ ẢNH BỊ TỪ CHỐI -> Móc lý do mới nhất trong DB ra
    if (item.getStatus() == DataItemStatus.REJECTED) {
      List<ReviewLog> logs = reviewLogRepository.findByDataItemIdOrderByCreatedAtDesc(item.getId());
      if (!logs.isEmpty()) {
        reason = logs.get(0).getComment();
      }
    }

    return DataItemResponse.builder()
        .id(item.getId())
        .fileName(item.getFileName())
        .fileUrl(item.getFileUrl())
        .status(item.getStatus())
        .rejectReason(reason) // 🌟 Gắn lý do vào DTO
        .build();
  }

  @Transactional
  public void deleteDataItem(String id) {
    DataItem item = dataItemRepository.findById(id).orElseThrow();

    // 1. Xóa trên Cloudinary (nếu bạn đã lưu publicId)
    // cloudinaryService.deleteImage(item.getPublicId());

    // 2. Xóa trong DB
    dataItemRepository.delete(item);

    // 3. 🛡️ Ghi log
    auditLogService.logAction("DELETE", "DATA_ITEM", "Xóa ảnh: " + item.getFileName(), "SUCCESS");
  }
}