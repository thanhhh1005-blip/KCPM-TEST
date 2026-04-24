package com.project.label.repository;

import com.project.label.entity.Annotation;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface IAnnotationRepository extends JpaRepository<Annotation, String> {
    // 🌟 Xóa các nhãn cũ của ảnh trước khi lưu nhãn mới
    void deleteByDataItemId(String dataItemId);
    List<Annotation> findByDataItemId(String dataItemId);

    @Query("SELECT a.label.name, COUNT(a.id) " +
           "FROM Annotation a " +
           "JOIN a.dataItem d " +
           "WHERE d.project.id = :projectId " +
           "GROUP BY a.label.name")
    List<Object[]> countLabelsByProjectId(@Param("projectId") String projectId);
    
    // Đếm số lượng ảnh đã làm và số ảnh bị từ chối của từng Annotator trong dự án
    @Query("SELECT u.firstName, u.lastName, u.username, " +
           "COUNT(DISTINCT d.id), " + // Tổng số ảnh đã gắn nhãn
           "COUNT(DISTINCT CASE WHEN d.status = 'REJECTED' THEN d.id ELSE NULL END) " + // Số ảnh bị từ chối
           "FROM Annotation a " +
           "JOIN a.dataItem d " +
           "JOIN a.annotator u " +
           "WHERE d.project.id = :projectId " +
           "GROUP BY u.id, u.firstName, u.lastName, u.username")
    List<Object[]> getAnnotatorStatsByProjectId(@Param("projectId") String projectId);
}