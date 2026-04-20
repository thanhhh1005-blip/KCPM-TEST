package com.project.label.service;

import com.project.label.entity.Annotation;
import com.project.label.entity.DataItem;
import com.project.label.entity.Label;
import com.project.label.enums.DataItemStatus;
import com.project.label.repository.IAnnotationRepository;
import com.project.label.repository.IDataItemRepository;
import com.project.label.repository.ILabelRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class ExportService {

    private final IDataItemRepository dataItemRepository;
    private final ILabelRepository labelRepository;
    private final IAnnotationRepository annotationRepository;

    public void exportYoloDataset(String projectId, HttpServletResponse response) throws Exception {
        // 1. Cấu hình file trả về là ZIP
        response.setContentType("application/zip");
        response.setHeader("Content-Disposition", "attachment; filename=\"dataset_" + projectId + ".zip\"");

        try (ZipOutputStream zos = new ZipOutputStream(response.getOutputStream())) {
            
            // 2. Lấy danh sách Nhãn (Labels) và tạo map ID -> Số thứ tự (0, 1, 2...)
            List<Label> labels = labelRepository.findByProject_Id(projectId);
            Map<String, Integer> labelIndexMap = new HashMap<>();
            StringBuilder classesTxt = new StringBuilder();
            
            for (int i = 0; i < labels.size(); i++) {
                labelIndexMap.put(labels.get(i).getId(), i);
                classesTxt.append(labels.get(i).getName()).append("\n");
            }

            // Ghi file classes.txt vào ZIP
            zos.putNextEntry(new ZipEntry("classes.txt"));
            zos.write(classesTxt.toString().getBytes());
            zos.closeEntry();

            // 3. Lấy các ảnh ĐÃ ĐƯỢC DUYỆT (APPROVED)
            List<DataItem> approvedItems = dataItemRepository.findByProjectIdAndStatus(projectId, DataItemStatus.APPROVED);

            for (DataItem item : approvedItems) {
                // Tách tên file (bỏ đuôi .jpg, .png để làm tên file .txt)
                String fileName = item.getFileName();
                int dotIndex = fileName.lastIndexOf('.');
                String baseName = (dotIndex == -1) ? fileName : fileName.substring(0, dotIndex);

                // --- A. TẢI ẢNH TỪ CLOUD VÀ GHI VÀO THƯ MỤC images/ ---
                try (InputStream in = new java.net.URI(item.getFileUrl()).toURL().openStream()) {
                    zos.putNextEntry(new ZipEntry("images/" + fileName));
                    byte[] buffer = new byte[8192];
                    int length;
                    while ((length = in.read(buffer)) > 0) {
                        zos.write(buffer, 0, length);
                    }
                    zos.closeEntry();
                } catch (Exception e) {
                    System.err.println("Không thể tải ảnh: " + item.getFileUrl());
                }

                // --- B. GHI TỌA ĐỘ YOLO VÀO THƯ MỤC labels/ ---
                List<Annotation> annotations = annotationRepository.findByDataItemId(item.getId());
                StringBuilder yoloLabels = new StringBuilder();
                
                for (Annotation ann : annotations) {
                    Integer classId = labelIndexMap.get(ann.getLabel().getId());
                    if (classId != null) {
                        // 🌟 QUAN TRỌNG: Dùng Locale.US để in dấu chấm (0.5) thay vì dấu phẩy (0,5)
                        String yoloLine = String.format(Locale.US, "%d %f %f %f %f\n",
                                classId, ann.getXCenter(), ann.getYCenter(), ann.getWidth(), ann.getHeight());
                        yoloLabels.append(yoloLine);
                    }
                }

                zos.putNextEntry(new ZipEntry("labels/" + baseName + ".txt"));
                zos.write(yoloLabels.toString().getBytes());
                zos.closeEntry();
            }
            
            zos.finish(); // Đóng gói xong!
        }
    }
}