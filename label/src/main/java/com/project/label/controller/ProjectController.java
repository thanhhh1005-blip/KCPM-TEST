package com.project.label.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.ProjectCreationRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.ProjectResponse;
import com.project.label.entity.Project;
import com.project.label.service.ProjectService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;

@RestController
@RequestMapping("/projects")
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class ProjectController {
  ProjectService projectService;

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
}
