package com.project.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.project.label.entity.Role;

@Repository
public interface IRoleRepository extends JpaRepository<Role, String>{

}
