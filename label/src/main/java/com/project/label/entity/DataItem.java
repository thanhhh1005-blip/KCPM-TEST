package com.project.label.entity;

import java.util.List;
import java.util.ArrayList;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.project.label.enums.DataItemStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
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
public class DataItem {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String fileName;
  
  @Column(columnDefinition = "TEXT")
  String fileUrl; // URL trả về từ Cloudinary

  private String rejectReason;

  @Enumerated(EnumType.STRING)
  DataItemStatus status;

  @ManyToOne
  @JoinColumn(name = "project_id")
  @JsonIgnore
  Project project;

  @OneToMany(mappedBy = "dataItem", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private List<Annotation> annotations = new ArrayList<>();
}
