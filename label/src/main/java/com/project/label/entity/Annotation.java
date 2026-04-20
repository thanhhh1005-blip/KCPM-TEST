package com.project.label.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Annotation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // Liên kết trực tiếp đến thực thể Label để lấy Màu sắc/Tên
    @ManyToOne
    @JoinColumn(name = "label_id")
    private Label label; 
    
    // Tọa độ chuẩn YOLO (Lưu số thập phân để AI dễ đọc)
    private double xCenter;
    private double yCenter;
    private double width;
    private double height;

    // Gắn với ảnh (DataItem) thay vì Task
    @ManyToOne
    @JoinColumn(name = "data_item_id")
    @JsonIgnore
    private DataItem dataItem;

    // Lưu thêm người đã vẽ để kiểm soát chất lượng
    @ManyToOne
    @JoinColumn(name = "user_id")
    private User annotator;
}