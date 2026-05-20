package com.project.label.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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
import java.util.ArrayList;
import java.util.Arrays;
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

    public void exportDatasetFlexible(String projectId, String format, HttpServletResponse response) throws Exception {
        
        if ("COCO".equalsIgnoreCase(format)) {
            exportCocoDataset(projectId, response); // Bạn sẽ code hàm này sau
            
        } else if ("VOC".equalsIgnoreCase(format)) {
            exportVocDataset(projectId, response); // Bạn sẽ code hàm này sau
            
        } else {
            // Mặc định chạy lại cái hàm YOLO cũ của bạn
            exportYoloDataset(projectId, response); 
        }
    }

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
                        //  QUAN TRỌNG: Dùng Locale.US để in dấu chấm (0.5) thay vì dấu phẩy (0,5)
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

    public void exportCocoDataset(String projectId, HttpServletResponse response) throws Exception {
        ZipOutputStream zos = new ZipOutputStream(response.getOutputStream());
        ObjectMapper mapper = new ObjectMapper(); // Công cụ biến Object thành JSON

        // Cấu trúc gốc của chuẩn COCO
        Map<String, Object> cocoFormat = new HashMap<>();
        List<Map<String, Object>> imagesList = new ArrayList<>();
        List<Map<String, Object>> annotationsList = new ArrayList<>();
        List<Map<String, Object>> categoriesList = new ArrayList<>();

        //  SỬA Ở ĐÂY: Lấy danh sách các Nhãn (Label) của dự án này
        // Ví dụ: List<Label> labels = labelRepository.findByProjectId(projectId);
        List<Label> labels = labelRepository.findByProject_Id(projectId);
        
        Map<String, Integer> categoryIdMap = new HashMap<>(); // Dùng để tra cứu ID nhanh
        int catId = 1;
        for (Label label : labels) {
            Map<String, Object> cat = new HashMap<>();
            cat.put("id", catId);
            cat.put("name", label.getName());
            categoriesList.add(cat);
            categoryIdMap.put(label.getName(), catId);
            catId++;
        }

        //  SỬA Ở ĐÂY: Lấy danh sách các ảnh ĐÃ DUYỆT
        List<DataItem> dataset = dataItemRepository.findByProjectIdAndStatus(projectId, DataItemStatus.APPROVED);
        
        int imageId = 1;
        int annId = 1;

        for (DataItem item : dataset) {
            Map<String, Object> img = new HashMap<>();
            img.put("id", imageId);
            img.put("file_name", item.getFileName());
            
            //  FIX 1: Gán cứng kích thước ảnh là 640x640 do DB không lưu
            img.put("width", 640);  
            img.put("height", 640);
            imagesList.add(img);

            List<Annotation> annotations = annotationRepository.findByDataItemId(item.getId());
            
            for (Annotation ann : annotations) {
                Map<String, Object> cocoAnn = new HashMap<>();
                cocoAnn.put("id", annId++);
                cocoAnn.put("image_id", imageId);
                
                //  FIX 2: Sửa cách lấy Tên Nhãn (Giả sử bạn dùng quan hệ @ManyToOne với bảng Label)
                String labelName = ann.getLabel().getName(); 
                cocoAnn.put("category_id", categoryIdMap.getOrDefault(labelName, 1));
                
                //  FIX 3: Sửa lại tên Getter cho đúng với Entity của bạn (xcenter, ycenter, width, height)
                // Lưu ý: COCO cần x_góc_trái, y_góc_trên. 
                // Nếu DB bạn lưu xcenter (tâm) thì x_góc_trái = xcenter - (width / 2)
                double xTopLeft = ann.getXCenter() - (ann.getWidth() / 2);
                double yTopLeft = ann.getYCenter() - (ann.getHeight() / 2);

                cocoAnn.put("bbox", Arrays.asList(xTopLeft, yTopLeft, ann.getWidth(), ann.getHeight()));
                cocoAnn.put("area", ann.getWidth() * ann.getHeight()); 
                cocoAnn.put("iscrowd", 0);
                
                annotationsList.add(cocoAnn);
            }
            imageId++;
        }

        // Đóng gói 3 danh sách vào cục JSON tổng
        cocoFormat.put("categories", categoriesList);
        cocoFormat.put("images", imagesList);
        cocoFormat.put("annotations", annotationsList);

        // Bỏ file annotations.json vào file nén ZIP
        ZipEntry entry = new ZipEntry("annotations.json");
        zos.putNextEntry(entry);
        // Ghi dữ liệu dạng JSON đẹp (Pretty Printer) vào file zip
        zos.write(mapper.writerWithDefaultPrettyPrinter().writeValueAsBytes(cocoFormat));
        zos.closeEntry();

        zos.finish();
        zos.close();
    }

    public void exportVocDataset(String projectId, HttpServletResponse response) throws Exception {
        // Mở luồng nén ZIP trực tiếp cho người dùng tải về
        ZipOutputStream zos = new ZipOutputStream(response.getOutputStream());

        //  SỬA Ở ĐÂY: Lấy danh sách các ảnh ĐÃ DUYỆT của dự án
        // Ví dụ: List<DataItem> dataset = dataItemRepository.findApprovedItemsByProjectId(projectId);
        List<DataItem> dataset = dataItemRepository.findByProjectIdAndStatus(projectId, DataItemStatus.APPROVED);

        for (DataItem item : dataset) {
            StringBuilder xml = new StringBuilder();
            xml.append("<annotation>\n");
            xml.append("  <filename>").append(item.getFileName()).append("</filename>\n");
            xml.append("  <size>\n");
            //  FIX 1: Gán cứng kích thước
            xml.append("    <width>640</width>\n");
            xml.append("    <height>640</height>\n");
            xml.append("    <depth>3</depth>\n");
            xml.append("  </size>\n");

            List<Annotation> annotations = annotationRepository.findByDataItemId(item.getId());

            for (Annotation ann : annotations) {
                //  FIX 3: Tính toán 4 góc dựa trên xcenter, ycenter
                double xmin = ann.getXCenter() - (ann.getWidth() / 2);
                double ymin = ann.getYCenter() - (ann.getHeight() / 2);
                double xmax = ann.getXCenter() + (ann.getWidth() / 2);
                double ymax = ann.getYCenter() + (ann.getHeight() / 2);

                xml.append("  <object>\n");
                //  FIX 2: Lấy tên nhãn
                xml.append("    <name>").append(ann.getLabel().getName()).append("</name>\n");
                xml.append("    <pose>Unspecified</pose>\n");
                xml.append("    <truncated>0</truncated>\n");
                xml.append("    <difficult>0</difficult>\n");
                xml.append("    <bndbox>\n");
                xml.append("      <xmin>").append((int) xmin).append("</xmin>\n");
                xml.append("      <ymin>").append((int) ymin).append("</ymin>\n");
                xml.append("      <xmax>").append((int) xmax).append("</xmax>\n");
                xml.append("      <ymax>").append((int) ymax).append("</ymax>\n");
                xml.append("    </bndbox>\n");
                xml.append("  </object>\n");
            }
            xml.append("</annotation>");

            // Đổi đuôi ảnh (.jpg, .png) thành đuôi .xml và bỏ vào thư mục Annotations
            String xmlFileName = item.getFileName().substring(0, item.getFileName().lastIndexOf('.')) + ".xml";
            ZipEntry entry = new ZipEntry("Annotations/" + xmlFileName);
            
            zos.putNextEntry(entry);
            zos.write(xml.toString().getBytes());
            zos.closeEntry();
        }

        zos.finish();
        zos.close();
    }
}