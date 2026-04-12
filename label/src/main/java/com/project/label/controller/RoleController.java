package com.project.label.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.RoleRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.RoleResponse;
import com.project.label.service.RoleService;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;



@RestController
@RequestMapping("/roles")
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class RoleController {
  RoleService roleService;

  @PostMapping
  public ApiResponse<RoleResponse> createRole(@RequestBody RoleRequest request){
    log.info("Creating role with name: {}", request.getName());
    return ApiResponse.<RoleResponse>builder()
                      .result(roleService.createRole(request))
                      .build();
  }


  @GetMapping()
  public ApiResponse<List<RoleResponse>> getAllRoles() {
    return ApiResponse.<List<RoleResponse>>builder()
                      .result(roleService.getAllRoles())
                      .build();
  }
  
  @DeleteMapping("/{roleName}")
  public ApiResponse<Void> deleteRole(@PathVariable String roleName){
    roleService.deleteRole(roleName);
    return ApiResponse.<Void>builder()
                      .build();
  }
  
  
}
