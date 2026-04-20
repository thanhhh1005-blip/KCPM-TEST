package com.project.label.repository;

import com.project.label.entity.ReviewLog;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IReviewLogRepository extends JpaRepository<ReviewLog, String> {
  List<ReviewLog> findByDataItemIdOrderByCreatedAtDesc(String dataItemId);
}