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
import com.project.label.enums.Role;
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
    // Set default role
    HashSet<String> role = new HashSet<>();
    role.add(Role.ANNOTATOR.name());
    //user.setRoles(role);
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
  @PreAuthorize("hasAuthority('GET_DATA')")
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
