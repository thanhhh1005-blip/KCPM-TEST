package com.project.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.Project;

@Repository
public interface IProjectRepository extends JpaRepository<Project, String> {

}
