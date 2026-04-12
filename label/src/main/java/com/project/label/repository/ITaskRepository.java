package com.project.label.repository;

import com.project.label.entity.Task;
import com.project.label.enums.TaskStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ITaskRepository extends JpaRepository<Task, String> {
    List<Task> findByReviewerIdAndStatus(String reviewerId, TaskStatus status);
}