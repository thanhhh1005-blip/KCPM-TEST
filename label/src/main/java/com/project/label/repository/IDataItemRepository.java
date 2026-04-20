package com.project.label.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.DataItem;
import com.project.label.enums.DataItemStatus;

@Repository
public interface IDataItemRepository extends JpaRepository<DataItem, String> {
  List<DataItem> findByProjectId(String projectId);

  List<DataItem> findByProjectIdAndStatus(String projectId, DataItemStatus status);
  List<DataItem> findByProjectIdAndStatusIn(String projectId, List<DataItemStatus> statuses);

  
}
