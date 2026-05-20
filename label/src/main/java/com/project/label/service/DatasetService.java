package com.project.label.service;

import com.project.label.dto.response.DataItemResponse;
import com.project.label.entity.DataItem;
import com.project.label.entity.Project;
import com.project.label.entity.ReviewLog;
import com.project.label.entity.SystemConfig;
import com.project.label.enums.DataItemStatus;
import com.project.label.enums.ProjectStatus;
import com.project.label.exception.AppException;
import com.project.label.exception.ErrorCode;
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

  @Transactional
    public List<String> uploadAndSaveDataset(List<MultipartFile> files, String projectId) {
        Project currentProject = projectRepository.findById(projectId)
            .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + projectId));

        // CHỈ CÒN LẠI CẤU HÌNH KIỂM TRA DUNG LƯỢNG
        SystemConfig sizeConfig = systemConfigRepository.findById("MAX_UPLOAD_SIZE_MB").orElse(null);
        long maxMb = (sizeConfig != null) ? Long.parseLong(sizeConfig.getValue()) : 5L;
        long maxBytes = maxMb * 1024 * 1024;
        
        List<String> uploadedUrls = new ArrayList<>();

        try {
            for (MultipartFile file : files) {
                // Kiểm tra dung lượng (Size)
                if (file.getSize() > maxBytes) {
                    throw new AppException(ErrorCode.OVERLOAD_FILE);
                }

                // KHÔNG CẦN KIỂM TRA ĐUÔI FILE NỮA -> UPLOAD LUÔN
                String url = cloudinaryService.uploadImage(file);
                uploadedUrls.add(url);

                // Lưu Database
                DataItem item = DataItem.builder()
                    .fileName(file.getOriginalFilename())
                    .fileUrl(url)
                    .status(DataItemStatus.UNLABELED)
                    .project(currentProject)
                    .build();
                dataItemRepository.save(item);
                
                if (currentProject.getStatus() == ProjectStatus.COMPLETED) {
                    currentProject.setStatus(ProjectStatus.IN_PROGRESS);
                    projectRepository.save(currentProject);
                }
            }
            return uploadedUrls;

        } catch (Exception e) {
            throw new AppException(ErrorCode.OVERLOAD_FILE);
        }
    }

  public List<DataItemResponse> getDatasetByProject(String projectId) {
    // Tìm tất cả DataItem theo ID dự án
    List<DataItem> items = dataItemRepository.findByProjectId(projectId);

    // Chuyển đổi Entity sang DTO và LẤY THÊM LÝ DO TỪ CHỐI (Nếu có)
    return items.stream().map(item -> {
      String reason = null;

      //  NẾU ẢNH BỊ TỪ CHỐI, MÓC LÝ DO TRONG LOG RA
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
          .rejectReason(reason) //  Gắn lý do vào đây để gửi cho React
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

    //  NẾU LÀ ẢNH BỊ TỪ CHỐI -> Móc lý do mới nhất trong DB ra
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
        .rejectReason(reason) //  Gắn lý do vào DTO
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