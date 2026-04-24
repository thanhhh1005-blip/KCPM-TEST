package com.project.label.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.project.label.entity.User;

@Repository
public interface IUserRepository extends JpaRepository<User, String> {// <Entity, ID type>
  boolean existsByUsername(String username);

  Optional<User> findByUsername(String username);

  List<User> findByRoles_Name(String roleName);

  Page<User> findByUsernameContainingIgnoreCaseOrEmailContainingIgnoreCase(
      String username, String email, Pageable pageable);

  @Query("SELECT u FROM User u WHERE " +
      "LOWER(u.username) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
      "LOWER(u.firstName) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
      "LOWER(u.lastName) LIKE LOWER(CONCAT('%', :search, '%'))")
  Page<User> searchUsers(@Param("search") String search, Pageable pageable);
}
