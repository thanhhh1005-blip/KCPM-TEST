package com.project.label.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

import com.project.label.dto.request.UserCreationRequest;
import com.project.label.dto.request.UserUpdateRequest;
import com.project.label.dto.response.UserResponse;
import com.project.label.entity.User;

@Mapper(componentModel = "spring")
public interface IUserMapper {
  @Mapping(target = "id", ignore = true)
  User toUser(UserCreationRequest request);

  @Mapping(source = "firstName", target = "lastName")
  UserResponse toUserResponse(User user);
  
  @Mapping(target = "id", ignore = true)
  @Mapping(target = "username", ignore = true)
  @Mapping(target = "roles", ignore = true)
  void updateUser(@MappingTarget User user, UserUpdateRequest request);
}
