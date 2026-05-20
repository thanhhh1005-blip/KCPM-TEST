package com.project.label.service;

import com.project.label.dto.request.AnnotationRequest;
import com.project.label.entity.Annotation;
import com.project.label.entity.DataItem;
import com.project.label.entity.Label;
import com.project.label.entity.User;
import com.project.label.enums.DataItemStatus;
import com.project.label.repository.IAnnotationRepository;
import com.project.label.repository.IDataItemRepository;
import com.project.label.repository.ILabelRepository;
import com.project.label.repository.IUserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class AnnotationService {
  IAnnotationRepository annotationRepository;
  IDataItemRepository dataItemRepository;
  ILabelRepository labelRepository;
  IUserRepository userRepository;

  @Transactional
  public void saveAll(AnnotationRequest request) {
    // 1. Tìm ảnh (DataItem)
    DataItem dataItem = dataItemRepository.findById(request.getDataItemId())
        .orElseThrow(() -> new RuntimeException("Không tìm thấy ảnh"));

    if (dataItem.getStatus() == DataItemStatus.LABELED || dataItem.getStatus() == DataItemStatus.APPROVED) {
        throw new RuntimeException("CẢNH BÁO: Bức ảnh này vừa được người khác hoàn thành. Vui lòng tải lại trang (F5) để nhận ảnh mới!");
    }

    // 2. Lấy thông tin Annotator đang thao tác
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    User annotator = userRepository.findByUsername(username).orElseThrow();

    // 3. Xóa các nhãn cũ của bức ảnh này để ghi đè cái mới
    annotationRepository.deleteByDataItemId(request.getDataItemId());

    // 4. Chuyển đổi DTO sang Entity và lưu
    List<Annotation> annotations = request.getAnnotations().stream()
        .map(detail -> {
          Label label = labelRepository.findById(detail.getLabelId())
              .orElseThrow(() -> new RuntimeException("Không tìm thấy Label"));

          return Annotation.builder()
              .label(label) 
              .xCenter(detail.getXcenter()) 
              .yCenter(detail.getYcenter())
              .width(detail.getWidth())
              .height(detail.getHeight())
              .dataItem(dataItem)
              .annotator(annotator) // Ghi nhận ai là người vẽ
              .build();
        })
        .collect(Collectors.toList());

    annotationRepository.saveAll(annotations);

    // 5. Cập nhật trạng thái bức ảnh thành "Đã gán"
    dataItem.setStatus(DataItemStatus.LABELED);
    dataItemRepository.save(dataItem);
  }
}