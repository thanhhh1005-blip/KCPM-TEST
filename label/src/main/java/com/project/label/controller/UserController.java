package com.project.label.controller;

import java.util.List;
import org.springframework.web.bind.annotation.RestController;

import com.project.label.dto.request.UserCreationRequest;
import com.project.label.dto.request.UserUpdateRequest;
import com.project.label.dto.response.ApiResponse;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.User;
import com.project.label.service.UserService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;





@RestController
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserController {
  UserService userService;

  @PostMapping("/users")
  public ApiResponse<User> createUser(@RequestBody @Valid UserCreationRequest request) {
    ApiResponse<User> response = new ApiResponse<User>();
    response.setResult(userService.createUser(request));
    return response;
  }
  
  @PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_MANAGER')")
  @GetMapping("/users")
  public ApiResponse<Page<UserResponse>> getUsers(
    @RequestParam(defaultValue = "0") int page,
    @RequestParam(defaultValue = "10") int size,
    @RequestParam(required = false, defaultValue = "") String search
  ) {
    var authentication = SecurityContextHolder.getContext().getAuthentication();
    log.info("Username: {}", authentication.getName());
    authentication.getAuthorities().forEach(grantedAuthority -> log.info(grantedAuthority.getAuthority()));

    Pageable pageable = PageRequest.of(page, size);

    return ApiResponse.<Page<UserResponse>>builder()
                      .result(userService.getAllUsers(search, pageable))
                      .build();
  }
  
  @GetMapping("/users/{userId}")  
  public ApiResponse<UserResponse> getUser(@PathVariable("userId") String userId) {
      return ApiResponse.<UserResponse>builder()
                      .result(userService.getUserById(userId))
                      .build();
  }
  
  @GetMapping("/users/myInfor")
  public ApiResponse<UserResponse> getMyInfor(){
    return ApiResponse.<UserResponse>builder()
              .result(userService.getMyInfor())
              .build();
  }


  @PutMapping("/users/{id}")
  public ApiResponse<UserResponse> updateUser(@PathVariable("id") String id, @RequestBody UserUpdateRequest user) {
    return ApiResponse.<UserResponse>builder()
                      .result(userService.updateUser(id, user))
                      .build();
  }

  @DeleteMapping("/users/{id}")
  public ApiResponse<String> deleteUser(@PathVariable("id") String id){
    userService.deleteUser(id);
    return ApiResponse.<String>builder()
                      .result("User deleted successfully")
                      .build();
  }
}
