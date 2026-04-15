package com.project.label.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.DataItem;

@Repository
public interface IDataItemRepository extends JpaRepository<DataItem, String> {
  List<DataItem> findByProjectId(String projectId);
}
