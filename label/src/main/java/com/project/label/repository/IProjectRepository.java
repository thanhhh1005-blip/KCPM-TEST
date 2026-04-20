package com.project.label.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.Project;
import com.project.label.entity.User;

@Repository
public interface IProjectRepository extends JpaRepository<Project, String> {
  List<Project> findByMembers_User(User user);
  List<Project> findByManager(User manager);

  List<Project> findByReviewer_Id(String reviewerId);
}
