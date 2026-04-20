package com.project.label.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.User;


@Repository
public interface IUserRepository extends JpaRepository<User, String> {//<Entity, ID type>
  boolean existsByUsername(String username);
  Optional<User> findByUsername(String username);

  List<User> findByRoles_Name(String roleName);
}
