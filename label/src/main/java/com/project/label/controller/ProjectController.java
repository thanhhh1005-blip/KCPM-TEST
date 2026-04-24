package com.project.label.controller;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.MemberAssignRequest;
import com.project.label.dto.request.ProjectCreationRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.DashBoardStatsResponse;
import com.project.label.dto.response.ProjectMemberResponse;
import com.project.label.dto.response.ProjectResponse;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.Project;
import com.project.label.entity.User;
import com.project.label.enums.DataItemStatus;
import com.project.label.repository.IAnnotationRepository;
import com.project.label.repository.IDataItemRepository;
import com.project.label.repository.IProjectRepository;
import com.project.label.repository.IUserRepository;
import com.project.label.service.ProjectService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProjectController {
    ProjectService projectService;
    IUserRepository userRepository;
    IProjectRepository projectRepository;
    IDataItemRepository dataItemRepository;
    IAnnotationRepository annotationRepository;
    @PostMapping
    public ApiResponse<Project> createProject(@RequestBody ProjectCreationRequest request) {
        return ApiResponse.<Project>builder()
                .result(projectService.createProject(request))
                .build();
    }

    @GetMapping("/{projectId}")
    public ApiResponse<ProjectResponse> getProjectById(@PathVariable String projectId) {
        ProjectResponse response = projectService.getProjectById(projectId);
        
        return ApiResponse.<ProjectResponse>builder()
                .result(response)
                .build();
    }
    @GetMapping
    public ApiResponse<List<ProjectResponse>> getAllProjects() {
        return ApiResponse.<List<ProjectResponse>>builder()
                .result(projectService.getAllProjects())
                .build();
    }

    @GetMapping("/users")
    public ApiResponse<List<UserResponse>> getAllUsers() {
        return ApiResponse.<List<UserResponse>>builder().result(projectService.getAllUsersForDropdown()).build();
    }

    @GetMapping("/{projectId}/members")
    public ApiResponse<List<ProjectMemberResponse>> getProjectMembers(@PathVariable String projectId) {
        return ApiResponse.<List<ProjectMemberResponse>>builder().result(projectService.getProjectMembers(projectId))
                .build();
    }

    @PostMapping("/{projectId}/members")
    public ApiResponse<String> addMember(@PathVariable String projectId, @RequestBody MemberAssignRequest request) {
        projectService.addProjectMember(projectId, request);
        return ApiResponse.<String>builder().result("Thêm thành viên thành công!").build();
    }

    @DeleteMapping("/{projectId}/members/{userId}")
    public ApiResponse<String> removeMember(@PathVariable String projectId, @PathVariable String userId) {
        projectService.removeProjectMember(projectId, userId);
        return ApiResponse.<String>builder().result("Đã xóa thành viên khỏi dự án!").build();
    }

    @GetMapping("/my-projects")
    public ApiResponse<List<ProjectResponse>> getMyProjects() {
        // 🌟 1. Lấy username của người đang đăng nhập (Annotator)
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();

        // 🌟 2. Gọi ĐÚNG CÁI HÀM getMyProjects mà chúng ta đã sửa trong Service
        return ApiResponse.<List<ProjectResponse>>builder()
                .result(projectService.getMyProjects(currentUsername))
                .build();
    }

    @GetMapping("/reviewer/my-projects")
    public ApiResponse<List<ProjectResponse>> getMyReviewProjects() { // 🌟 Đổi sang List<ProjectResponse>
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        List<ProjectResponse> result = projectService.getMyReviewProjects(currentUsername);
        return ApiResponse.<List<ProjectResponse>>builder()
                .result(result) // 🌟 Trả về DTO
                .build();
    } 

    @GetMapping("/{projectId}/dashboard")
    public ApiResponse<DashBoardStatsResponse> getProjectDashboard(@PathVariable String projectId) {
        
        DashBoardStatsResponse result = projectService.getProjectDashboard(projectId);

        return ApiResponse.<DashBoardStatsResponse>builder().result(result).build();
    }

    @PutMapping("/{id}")
    public ApiResponse<Void> updateProject(@PathVariable String id, @RequestBody ProjectCreationRequest request) {
        projectService.updateProject(id, request);
        return ApiResponse.<Void>builder().message("Cập nhật dự án thành công").build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> deleteProject(@PathVariable String id) {
        projectService.deleteProject(id);
        return ApiResponse.<Void>builder().message("Xóa dự án thành công").build();
    }
}
