package com.project.label.mapper;

import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

import com.project.label.dto.request.RoleRequest;
import com.project.label.dto.response.RoleResponse;
import com.project.label.entity.Role;

@Mapper(componentModel = "spring")
public interface IRoleMapper {
  @Mapping(target = "permissions", ignore = true)
  Role toRole(RoleRequest request);
  RoleResponse toRoleResponse(Role role);
}
