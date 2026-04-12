package com.project.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.Permission;


@Repository
public interface IPermissionRepository extends JpaRepository<Permission, String>{

}
