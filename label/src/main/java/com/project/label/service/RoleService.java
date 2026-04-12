package com.project.label.service;


import java.util.HashSet;
import java.util.List;

import org.springframework.stereotype.Service;

import com.project.label.dto.request.RoleRequest;
import com.project.label.dto.response.RoleResponse;
import com.project.label.mapper.IRoleMapper;
import com.project.label.repository.IPermissionRepository;
import com.project.label.repository.IRoleRepository;

import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;


@Service
@Slf4j
@RequiredArgsConstructor
@FieldDefaults(level = lombok.AccessLevel.PRIVATE, makeFinal = true)
public class RoleService {
  IRoleRepository roleRepository;
  IRoleMapper roleMapper;
  IPermissionRepository permissionRepository;

  public RoleResponse createRole(RoleRequest request){
    var role = roleMapper.toRole(request);
    var permissions = permissionRepository.findAllById(request.getPermissions());
    role.setPermissions(new HashSet<>(permissions));
    roleRepository.save(role);
    return roleMapper.toRoleResponse(role);
  }

  public List<RoleResponse> getAllRoles(){
    return roleRepository.findAll().stream().map(roleMapper::toRoleResponse).toList();
  }

  public void deleteRole(String roleName){
    roleRepository.deleteById(roleName);
  }
}
