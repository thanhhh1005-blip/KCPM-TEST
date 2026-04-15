package com.project.label.repository;

import com.project.label.entity.Annotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IAnnotationRepository extends JpaRepository<Annotation, String> {
    // Xóa các nhãn cũ của Task trước khi lưu nhãn mới để tránh trùng lặp
    void deleteByTaskId(String taskId);
}