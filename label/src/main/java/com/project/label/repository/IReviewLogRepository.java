package com.project.label.repository;

import com.project.label.entity.ReviewLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface IReviewLogRepository extends JpaRepository<ReviewLog, Long> {
}