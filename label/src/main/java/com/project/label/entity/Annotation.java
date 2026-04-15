package com.project.label.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Data
public class Annotation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private int labelId; // 0: Car, 1: Motorbike...
    
    // Tọa độ chuẩn YOLO (0.0 -> 1.0)
    private double xCenter;
    private double yCenter;
    private double width;
    private double height;

    @ManyToOne
    @JoinColumn(name = "task_id")
    private Task task; // Nhãn này thuộc về ảnh (Task) nào
}