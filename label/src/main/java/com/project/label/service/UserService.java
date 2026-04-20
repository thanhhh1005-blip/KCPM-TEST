package com.project.label.service;

import java.util.HashSet;
import java.util.List;

import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.project.label.dto.request.UserCreationRequest;
import com.project.label.dto.request.UserUpdateRequest;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.User;
import com.project.label.entity.Role;
import com.project.label.exception.AppException;
import com.project.label.exception.ErrorCode;
import com.project.label.mapper.IUserMapper;
import com.project.label.repository.IRoleRepository;
import com.project.label.repository.IUserRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
  IUserRepository userRepository;
  IRoleRepository roleRepository;
  IUserMapper userMapper;
  
  PasswordEncoder passwordEncoder;
  public User createUser(UserCreationRequest request) {
    
    if(userRepository.existsByUsername(request.getUsername())){
      throw new AppException(ErrorCode.USER_EXISTS);
    }
    User user = userMapper.toUser(request); 
    user.setPassword(passwordEncoder.encode(request.getPassword()));
    
    // 🌟 LOGIC CẤP QUYỀN MỚI TẠI ĐÂY
    HashSet<Role> roles = new HashSet<>();

    // 1. Nếu Request có truyền danh sách Role (Tức là Admin đang dùng giao diện Quản lý để tạo)
    if (request.getRoles() != null && !request.getRoles().isEmpty()) {
        for (Role roleObj : request.getRoles()) { 
            
            // Bóc lấy cái tên (ví dụ: "MANAGER") từ trong Object ra
            String roleName = roleObj.getName();
            
            com.project.label.entity.Role role = roleRepository.findById(roleName)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy Role: " + roleName));
            roles.add(role);
        }
    } 
    // 2. Nếu Request KHÔNG truyền Role (Tức là chức năng Khách tự Đăng ký sau này)
    else {
        Role defaultRole = roleRepository.findById("ANNOTATOR")
            .orElseThrow(() -> new RuntimeException("Không tìm thấy Role ANNOTATOR trong DB!"));
        roles.add(defaultRole);
    }

    user.setRoles(roles);
    return userRepository.save(user);
  }

  public UserResponse updateUser(String userId, UserUpdateRequest request){
    User user = userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
    userMapper.updateUser(user, request);
    user.setPassword(passwordEncoder.encode(request.getPassword()));

    var role = roleRepository.findAllById(request.getRoles());
    user.setRoles(new HashSet<>(role));
    return userMapper.toUserResponse(userRepository.save(user));
  }

  public UserResponse getMyInfor(){
    // Get username from security context
    var context = SecurityContextHolder.getContext();
    var authentication = context.getAuthentication();

    String username = authentication.getName();
    User user = userRepository.findByUsername(username).orElseThrow(() -> new AppException(ErrorCode.USER_NOT_EXISTS));
    return userMapper.toUserResponse(user);
  }

  //@PreAuthorize("hasRole('ADMIN')")
  public List<UserResponse> getUsers() {
    log.info("In method get users");
    return userRepository.findAll().stream()
          .map(userMapper::toUserResponse)
          .toList();
  }

  @PostAuthorize("returnObject.username == authentication.name or hasRole('ADMIN')")
  public UserResponse getUserById(String userId) {
    return userMapper.toUserResponse(userRepository.findById(userId).orElseThrow(() -> new RuntimeException("User not found with id: " + userId)));
  }

  public void deleteUser(String userId){
    userRepository.deleteById(userId);
  }
}
