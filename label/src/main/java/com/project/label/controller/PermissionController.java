package com.project.label.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.PermissionRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.PermissionResponse;
import com.project.label.service.PermissionService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;


@RestController
@RequestMapping("/permissions")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class PermissionController {
  PermissionService permissionService;

  @PostMapping
  public ApiResponse<PermissionResponse> createPermission(@RequestBody PermissionRequest request){
    return ApiResponse.<PermissionResponse>builder()
                      .result(permissionService.createPermission(request))
                      .build();
  }

  @GetMapping()
  public ApiResponse<List<PermissionResponse>> getPermissions() {
      return ApiResponse.<List<PermissionResponse>>builder()
                        .result(permissionService.getAllPermissions())
                        .build();
  }
  
  @DeleteMapping("/{permissionName}")
  public ApiResponse<Void> deletePermission(@PathVariable String permissionName){
    permissionService.deletePermission(permissionName);
    return ApiResponse.<Void>builder()
                      .build();
  }
}
