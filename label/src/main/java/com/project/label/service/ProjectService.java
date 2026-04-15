package com.project.label.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.project.label.dto.request.ProjectCreationRequest;
import com.project.label.dto.response.ProjectResponse;
import com.project.label.entity.Label;
import com.project.label.entity.Project;
import com.project.label.entity.User;
import com.project.label.enums.ProjectStatus;
import com.project.label.repository.ILabelRepository;
import com.project.label.repository.IProjectRepository;
import com.project.label.repository.IUserRepository;

import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProjectService {
  IUserRepository userRepository;
  ILabelRepository labelRepository;
  IProjectRepository projectRepository;

  @Transactional
  public Project createProject(ProjectCreationRequest request) {
      // 1. Lấy thông tin user (Manager) đang đăng nhập
      String username = SecurityContextHolder.getContext().getAuthentication().getName();
      User manager = userRepository.findByUsername(username)
              .orElseThrow(() -> new RuntimeException("User not found"));

      // 2. Tạo Project mới
      Project project = Project.builder()
              .name(request.getName())
              .description(request.getDescription())
              .status(ProjectStatus.DRAFT)
              .manager(manager)
              .build();
      Project savedProject = projectRepository.save(project);

      // 3. Tạo danh sách các Label và liên kết với Project vừa lưu
      if (request.getLabels() != null && !request.getLabels().isEmpty()) {
          List<Label> labels = request.getLabels().stream().map(lblReq -> 
              Label.builder()
                  .name(lblReq.getName())
                  .color(lblReq.getColor())
                  .project(savedProject) // Liên kết khóa ngoại
                  .build()
          ).collect(Collectors.toList());
          
          labelRepository.saveAll(labels);
      }

      return savedProject;
  }

    // getAll projects, có thể thêm filter theo manager nếu muốn
  public List<ProjectResponse> getAllProjects() {
      List<Project> projects = projectRepository.findAll();
      return projects.stream().map(project -> ProjectResponse.builder()
              .id(project.getId())
              .name(project.getName())
              .description(project.getDescription())
              .status(project.getStatus())
              .labelCount(project.getLabels() != null ? project.getLabels().size() : 0)
              .dataItemCount(project.getDataItems() != null ? project.getDataItems().size() : 0)
              .createdAt(project.getCreatedAt())
              .build()
      ).collect(Collectors.toList());
  }
}
