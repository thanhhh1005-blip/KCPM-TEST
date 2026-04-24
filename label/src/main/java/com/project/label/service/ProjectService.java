package com.project.label.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.project.label.dto.request.MemberAssignRequest;
import com.project.label.dto.request.ProjectCreationRequest;
import com.project.label.dto.response.DashBoardStatsResponse;
import com.project.label.dto.response.ProjectMemberResponse;
import com.project.label.dto.response.ProjectResponse;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.Label;
import com.project.label.entity.Project;
import com.project.label.entity.ProjectMember;
import com.project.label.entity.User;
import com.project.label.enums.DataItemStatus;
import com.project.label.enums.ProjectStatus;
import com.project.label.entity.Role;
import com.project.label.repository.IAnnotationRepository;
import com.project.label.repository.IDataItemRepository;
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
  IDataItemRepository dataItemRepository;
  IAnnotationRepository annotationRepository;
  AuditLogService auditLogService;

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
    // 🌟 Đã thêm "SUCCESS" vào cuối cùng
    auditLogService.logAction("CREATE", "PROJECT", "Đã tạo dự án mới: " + savedProject.getName(), "SUCCESS");
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

    return projects.stream().map(project -> {

      // ==========================================
      // 🌟 LOGIC TỰ ĐỘNG CHUYỂN TRẠNG THÁI DỰ ÁN
      // ==========================================

      // Đếm số lượng ảnh và số ảnh đã duyệt của dự án này
      long totalItems = dataItemRepository.countByProjectId(project.getId());
      long approvedItems = dataItemRepository.countByProjectIdAndStatus(project.getId(), DataItemStatus.APPROVED);

      ProjectStatus calculatedStatus = project.getStatus();

      // Nếu dự án có ảnh thì mới bắt đầu tính toán trạng thái
      if (totalItems > 0) {
        if (approvedItems == totalItems) {
          calculatedStatus = ProjectStatus.COMPLETED; // Đã duyệt hết -> Hoàn thành
        } else {
          calculatedStatus = ProjectStatus.IN_PROGRESS; // Đang làm dang dở
        }

        // Nếu phát hiện trạng thái thực tế khác với database thì tự động cập nhật lưu
        // lại DB
        if (project.getStatus() != calculatedStatus) {
          project.setStatus(calculatedStatus);
          projectRepository.save(project);
        }
      }

      // Trả về DTO với dữ liệu mới nhất
      return ProjectResponse.builder()
          .id(project.getId())
          .name(project.getName())
          .description(project.getDescription())
          .status(calculatedStatus) // 🌟 Sử dụng trạng thái vừa tính toán
          .labelCount(project.getLabels() != null ? project.getLabels().size() : 0)
          .dataItemCount((int) totalItems) // Lấy con số thực tế luôn cho chuẩn xác
          .createdAt(project.getCreatedAt())
          .build();

    }).collect(Collectors.toList());
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

  public ProjectResponse getProjectById(String projectId) {
    // Tìm dự án trong Database
    Project project = projectRepository.findById(projectId)
        .orElseThrow(() -> new RuntimeException("Không tìm thấy dự án với ID: " + projectId));

    // Dùng Builder để map dữ liệu sang ProjectResponse
    return ProjectResponse.builder()
        .id(project.getId())
        .name(project.getName())
        .description(project.getDescription()) // 🌟 Chìa khóa để Frontend hiện chữ
        .status(project.getStatus())
        .createdAt(project.getCreatedAt())
        // Bạn có thể set thêm labelCount và dataItemCount nếu cần thiết
        .build();
  }

  // Trong ProjectService.java

  public List<ProjectResponse> getMyProjects(String username) { // Tên hàm của bạn có thể khác
    User currentUser = userRepository.findByUsername(username).orElseThrow();

    // Giả sử hàm lấy project cho Annotator của bạn
    List<Project> projects = projectRepository.findProjectsForAnnotator(currentUser.getId());
    return projects.stream().map(p -> {

      long pendingCount = dataItemRepository.countByProjectIdAndStatusIn(
          p.getId(),
          List.of(DataItemStatus.UNLABELED, DataItemStatus.REJECTED));
      long approvedCount = dataItemRepository.countByProjectIdAndStatus(
          p.getId(),
          DataItemStatus.APPROVED);
      System.out.println("===============LOG===============" + pendingCount);
      return ProjectResponse.builder()
          .id(p.getId())
          .name(p.getName())
          .description(p.getDescription())
          .status(p.getStatus())
          .labelCount(annotationRepository.countLabelsByProjectId(p.getId()).size())
          .dataItemCount((int) dataItemRepository.countByProjectId(p.getId()))
          .pendingItemCount(pendingCount)
          .approvedItemCount(approvedCount)

          .build();

    }).collect(Collectors.toList());
  }

  public List<ProjectResponse> getMyReviewProjects(String username) {
    User currentUser = userRepository.findByUsername(username).orElseThrow();

    // 🌟 Phải gọi findByReviewer_Id
    List<Project> projects = projectRepository.findByReviewer_Id(currentUser.getId());

    return projects.stream().map(p -> {
      // 🌟 Chỉ đếm ảnh LABELED (Đang chờ duyệt)
      // Trong hàm getMyReviewProjects (của Reviewer)
      long pendingCount = dataItemRepository.countByProjectIdAndStatus(
          p.getId(),
          DataItemStatus.LABELED);
      long approvedCount = dataItemRepository.countByProjectIdAndStatus(p.getId(), DataItemStatus.APPROVED);
      System.out.println("===============LOG===============" + pendingCount);
      return ProjectResponse.builder()
          .id(p.getId())
          .name(p.getName())
          .description(p.getDescription())
          .status(p.getStatus())
          .labelCount(annotationRepository.countLabelsByProjectId(p.getId()).size())
          .dataItemCount((int) dataItemRepository.countByProjectId(p.getId()))
          .pendingItemCount(pendingCount)
          .approvedItemCount(approvedCount)
          .build();

    }).collect(Collectors.toList());
  }

  public DashBoardStatsResponse getProjectDashboard(String projectId) {
    long total = dataItemRepository.countByProjectId(projectId);
    long approved = dataItemRepository.countByProjectIdAndStatus(projectId, DataItemStatus.APPROVED);
    long pending = dataItemRepository.countByProjectIdAndStatus(projectId, DataItemStatus.LABELED); // Labeled tức
                                                                                                    // là
                                                                                                    // chờ duyệt
    long rejected = dataItemRepository.countByProjectIdAndStatus(projectId, DataItemStatus.REJECTED);

    // 2. LẤY DỮ LIỆU LABEL THẬT TỪ DATABASE
    List<Object[]> rawLabelStats = annotationRepository.countLabelsByProjectId(projectId);

    // LẤY THỐNG KÊ ANNOTATOR TỪ DATABASE
    List<Object[]> rawAnnotatorStats = annotationRepository.getAnnotatorStatsByProjectId(projectId);
    List<DashBoardStatsResponse.AnnotatorStatResponse> annotatorStatsList = new ArrayList<>();

    for (Object[] row : rawAnnotatorStats) {
      // Cột 0: firstName, Cột 1: lastName, Cột 2: username
      String fullName = row[0] + " " + row[1] + " (@" + row[2] + ")";
      long done = (Long) row[3];
      rejected = (Long) row[4];

      // Tính phần trăm lỗi (tránh lỗi chia cho 0)
      long errorRate = (done == 0) ? 0 : (rejected * 100 / done);

      annotatorStatsList.add(DashBoardStatsResponse.AnnotatorStatResponse.builder()
          .name(fullName)
          .done(done)
          .rejected(rejected)
          .errorRate(errorRate + "%")
          .build());
    }
    // Chuyển đổi List<Object[]> thành Map<String, Long> cho đúng với DTO
    Map<String, Long> realLabelStats = new HashMap<>();
    for (Object[] row : rawLabelStats) {
      String labelName = (String) row[0];
      Long count = (Long) row[1];
      realLabelStats.put(labelName, count);
    }

    // 3. Đóng gói gửi về React
    return DashBoardStatsResponse.builder()
        .totalImages(total)
        .approvedImages(approved)
        .pendingImages(pending)
        .rejectedImages(rejected)
        .labelStats(realLabelStats)
        .annotatorStats(annotatorStatsList)
        .build();
  }

  @Transactional
  public void deleteProject(String projectId) {
    Project project = projectRepository.findById(projectId).orElseThrow();
    String projectName = project.getName();

    projectRepository.delete(project);

    // 🛡️ Ghi log hành động xóa dự án
    auditLogService.logAction("DELETE", "PROJECT", "Đã xóa dự án: " + projectName, "SUCCESS");
  }

  @Transactional
  public void updateProject(String projectId, ProjectCreationRequest request) {
    Project project = projectRepository.findById(projectId).orElseThrow();
    String oldName = project.getName();

    project.setName(request.getName());
    project.setDescription(request.getDescription());
    projectRepository.save(project);

    // 🛡️ Ghi log hành động cập nhật
    auditLogService.logAction("UPDATE", "PROJECT",
        "Cập nhật dự án '" + oldName + "' thành '" + request.getName() + "'", "SUCCESS");
  }
}