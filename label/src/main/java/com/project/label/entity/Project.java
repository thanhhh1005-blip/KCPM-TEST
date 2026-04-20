package com.project.label.entity;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import com.project.label.enums.ProjectStatus;

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
import jakarta.persistence.PrePersist;
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
@FieldDefaults(level = lombok.AccessLevel.PRIVATE)
public class Project {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  String id;

  String name;

  @Column(columnDefinition = "TEXT")
  String description; // Hướng dẫn gán nhãn

  @Enumerated(EnumType.STRING)
  ProjectStatus status;

  @ManyToOne
  @JoinColumn(name = "manager_id")
  User manager; // Người tạo và quản lý dự án

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
  List<Label> labels;

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL)
  List<DataItem> dataItems;

  LocalDateTime createdAt;
  LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
      createdAt = LocalDateTime.now();
      status = ProjectStatus.DRAFT;
  }

  @OneToMany(mappedBy = "project", cascade = CascadeType.ALL, orphanRemoval = true)
  @Builder.Default
  private Set<ProjectMember> members = new HashSet<>();

  @ManyToOne
  @JoinColumn(name = "reviewer_id")
  private User reviewer; // Người chịu trách nhiệm duyệt nhãn
}
