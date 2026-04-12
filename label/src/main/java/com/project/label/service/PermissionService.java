package com.project.label.service;



import java.util.List;

import org.springframework.stereotype.Service;

import com.project.label.dto.request.PermissionRequest;
import com.project.label.dto.response.PermissionResponse;
import com.project.label.entity.Permission;
import com.project.label.mapper.IPermissionMapper;
import com.project.label.repository.IPermissionRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
@Slf4j
public class PermissionService {
  IPermissionRepository permissionRepository;
  IPermissionMapper permissionMapper;

  public PermissionResponse createPermission(PermissionRequest request){
    Permission permission = permissionMapper.toPermission(request);
    permission = permissionRepository.save(permission);
    return permissionMapper.toPermissionReponse(permission);
  }
  

  public List<PermissionResponse> getAllPermissions(){
    var permissions = permissionRepository.findAll();
    return permissions.stream().map(permissionMapper::toPermissionReponse).toList();
  }

  public void deletePermission(String permissionName){
    permissionRepository.deleteById(permissionName);
  }
}
