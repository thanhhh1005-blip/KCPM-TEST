package com.project.label.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.AccessLevel;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.FieldDefaults;

@Entity
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE)
public class Label {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String name; // Tên nhãn: "Person", "Traffic Light",...
  String color; // Mã màu HEX để hiển thị trên Canvas UI (ví dụ: #FF5733)

  @ManyToOne
  @JoinColumn(name = "project_id")
  Project project;
}
