package com.project.label.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import com.project.label.entity.Project;
import com.project.label.entity.User;

@Repository
public interface IProjectRepository extends JpaRepository<Project, String> {
  List<Project> findByMembers_User(User user);
  List<Project> findByManager(User manager);

  List<Project> findByReviewer_Id(String reviewerId);
  //  Câu Query mới đã được cập nhật để đi qua bảng trung gia n ProjectMember
    @Query("SELECT p FROM Project p JOIN p.members m WHERE m.user.id = :annotatorId")
    List<Project> findProjectsForAnnotator(@org.springframework.data.repository.query.Param("annotatorId") String annotatorId);
}
