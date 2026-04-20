package com.project.label.repository;

import com.project.label.entity.Annotation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IAnnotationRepository extends JpaRepository<Annotation, String> {
    // 🌟 Xóa các nhãn cũ của ảnh trước khi lưu nhãn mới
    void deleteByDataItemId(String dataItemId);
    List<Annotation> findByDataItemId(String dataItemId);
}