package com.project.label.service;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.project.label.dto.request.MemberAssignRequest;
import com.project.label.dto.request.ProjectCreationRequest;
import com.project.label.dto.response.ProjectMemberResponse;
import com.project.label.dto.response.ProjectResponse;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.Label;
import com.project.label.entity.Project;
import com.project.label.entity.ProjectMember;
import com.project.label.entity.User;
import com.project.label.enums.ProjectStatus;
import com.project.label.entity.Role;
import com.project.label.repository.ILabelRepository;
import com.project.label.repository.IProjectRepository;
import com.project.label.repository.IRoleRepository;
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
  IRoleRepository roleRepository;

  @Transactional
  public Project createProject(ProjectCreationRequest request) {
    // 1. Lấy thông tin user đang đăng nhập (Người bấm nút tạo)
    String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
    User currentUser = userRepository.findByUsername(currentUsername)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy user đăng nhập"));

    // Kiểm tra xem người này có phải là ADMIN không
    boolean isAdmin = currentUser.getRoles().stream()
        .anyMatch(role -> role.getName().equals("ADMIN"));

    // 2. Xác định Manager của dự án
    User manager;
    if (isAdmin) {
      // Nếu là ADMIN: Lấy Manager dựa trên ID được chọn từ giao diện
      if (request.getManagerId() == null || request.getManagerId().isEmpty()) {
        throw new RuntimeException("Admin phải chỉ định Manager cho dự án!");
      }
      manager = userRepository.findById(request.getManagerId())
          .orElseThrow(() -> new RuntimeException(
              "Không tìm thấy Manager được chỉ định!"));
    } else {
      // Nếu là Manager tự tạo: Mặc định chính họ là quản lý
      manager = currentUser;
    }

    // 3. Xác định Reviewer của dự án
    User reviewer = userRepository.findById(request.getReviewerId())
        .orElseThrow(() -> new RuntimeException("Không tìm thấy Reviewer được chỉ định!"));

    // 4. Xây dựng và lưu Project
    Project project = Project.builder()
        .name(request.getName())
        .description(request.getDescription())
        .status(ProjectStatus.DRAFT)
        .manager(manager) // 🌟 Gán Manager đã xử lý
        .reviewer(reviewer) // 🌟 Gán Reviewer
        .build();

    Project savedProject = projectRepository.save(project);

    // 5. Lưu Labels (Giữ nguyên code của bạn)
    if (request.getLabels() != null && !request.getLabels().isEmpty()) {
      List<Label> labels = request.getLabels().stream().map(lblReq -> Label.builder()
          .name(lblReq.getName())
          .color(lblReq.getColor())
          .project(savedProject)
          .build()).collect(Collectors.toList());
      labelRepository.saveAll(labels);
    }

    return savedProject;
  }

  public List<ProjectResponse> getAllProjects() {
    // 1. Xem ai đang gọi API này
    String username = SecurityContextHolder.getContext().getAuthentication().getName();
    User currentUser = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));

    // 2. Kiểm tra xem người này có phải ADMIN không
    boolean isAdmin = currentUser.getRoles().stream()
        .anyMatch(role -> role.getName().equals("ADMIN"));

    List<Project> projects;

    // 🌟 LOGIC LỌC: Admin thấy hết, Manager chỉ thấy dự án của mình
    if (isAdmin) {
      projects = projectRepository.findAll();
    } else {
      projects = projectRepository.findByManager(currentUser);
    }

    return projects.stream().map(project -> ProjectResponse.builder()
        .id(project.getId())
        .name(project.getName())
        .description(project.getDescription())
        .status(project.getStatus())
        .labelCount(project.getLabels() != null ? project.getLabels().size() : 0)
        .dataItemCount(project.getDataItems() != null ? project.getDataItems().size() : 0)
        .createdAt(project.getCreatedAt())
        .build()).collect(Collectors.toList());
  }

  // Lấy danh sách để hiện lên Dropdown
  public List<UserResponse> getAllUsersForDropdown() {
    return userRepository.findAll().stream()
        .map(user -> UserResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .firstName(user.getFirstName())
            .lastName(user.getLastName())
            .build())
        .collect(Collectors.toList());
  }

  // Lấy danh sách thành viên hiện tại của dự án
  public List<ProjectMemberResponse> getProjectMembers(String projectId) {
    Project project = projectRepository.findById(projectId).orElseThrow();
    return project.getMembers().stream()
        .map(m -> ProjectMemberResponse.builder()
            .userId(m.getUser().getId())
            .fullName(m.getUser().getFirstName() + " " + m.getUser().getLastName())
            .username(m.getUser().getUsername())
            .build())
        .collect(Collectors.toList());
  }

  // 🌟 THÊM THÀNH VIÊN VỚI ROLE LINH HOẠT
  @Transactional
  public void addProjectMember(String projectId, MemberAssignRequest request) {
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án"));
    User user = userRepository.findById(request.getUserId())
        .orElseThrow(() -> new RuntimeException("Không tìm thấy User"));
    Role role = roleRepository.findById(request.getRoleName())
        .orElseThrow(() -> new RuntimeException(
            "Không tìm thấy Role: " + request.getRoleName()));

    // Xóa quyền cũ nếu user đã tồn tại trong dự án
    project.getMembers().removeIf(m -> m.getUser().getId().equals(user.getId()));

    ProjectMember newMember = ProjectMember.builder()
        .project(project)
        .user(user)
        .build();
    project.getMembers().add(newMember);
    projectRepository.save(project);
  }

  // Xóa thành viên khỏi dự án
  @Transactional
  public void removeProjectMember(String projectId, String userId) {
    Project project = projectRepository.findById(projectId).orElseThrow();
    project.getMembers().removeIf(m -> m.getUser().getId().equals(userId));
    projectRepository.save(project);
  }

  // Lấy dự án mà user đang đăng nhập có tham gia
  public List<ProjectResponse> getMyAssignedProjects() {
    String username = SecurityContextHolder.getContext().getAuthentication().getName();

    User currentUser = userRepository.findByUsername(username)
        .orElseThrow(() -> new RuntimeException("User not found"));

    List<Project> myProjects = projectRepository.findByMembers_User(currentUser);

    return myProjects.stream().map(project -> ProjectResponse.builder()
        .id(project.getId())
        .name(project.getName())
        .description(project.getDescription())
        .status(project.getStatus())
        .labelCount(project.getLabels() != null ? project.getLabels().size() : 0)
        .dataItemCount(project.getDataItems() != null ? project.getDataItems().size() : 0)
        .createdAt(project.getCreatedAt())
        .build()).collect(Collectors.toList());
  }
}