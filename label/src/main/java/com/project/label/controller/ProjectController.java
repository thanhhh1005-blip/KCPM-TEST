package com.project.label.controller;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.MemberAssignRequest;
import com.project.label.dto.request.ProjectCreationRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.ProjectMemberResponse;
import com.project.label.dto.response.ProjectResponse;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.Project;
import com.project.label.entity.User;
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

    @PostMapping
    public ApiResponse<Project> createProject(@RequestBody ProjectCreationRequest request) {
        return ApiResponse.<Project>builder()
                .result(projectService.createProject(request))
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
        // Gọi xuống Service để lấy danh sách dự án mà user hiện tại tham gia
        return ApiResponse.<List<ProjectResponse>>builder()
                .result(projectService.getMyAssignedProjects())
                .build();
    }

    @GetMapping("/reviewer/my-projects")
    public ApiResponse<List<ProjectResponse>> getMyReviewProjects() { // 🌟 Đổi sang List<ProjectResponse>
        String currentUsername = SecurityContextHolder.getContext().getAuthentication().getName();
        User currentUser = userRepository.findByUsername(currentUsername).orElseThrow();

        // 1. Lấy danh sách Entity
        List<Project> projects = projectRepository.findByReviewer_Id(currentUser.getId());

        // 2. Map Entity sang DTO để lọc sạch các vòng lặp rác
        List<ProjectResponse> projectResponses = projects.stream().map(p -> ProjectResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .description(p.getDescription())
                // ... map các field cần thiết khác
                .build()).collect(Collectors.toList());

        return ApiResponse.<List<ProjectResponse>>builder()
                .result(projectResponses) // 🌟 Trả về DTO
                .build();
    }
}
