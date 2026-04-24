package com.project.label.repository;

import com.project.label.entity.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ISystemConfigRepository extends JpaRepository<SystemConfig, String> {
}