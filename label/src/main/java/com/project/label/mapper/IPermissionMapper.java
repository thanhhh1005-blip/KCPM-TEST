package com.project.label.mapper;

import org.mapstruct.Mapper;

import com.project.label.dto.request.PermissionRequest;
import com.project.label.dto.response.PermissionResponse;
import com.project.label.entity.Permission;

@Mapper(componentModel = "spring")
public interface IPermissionMapper {
  Permission toPermission(PermissionRequest request);
  PermissionResponse toPermissionReponse(Permission permission);
}
