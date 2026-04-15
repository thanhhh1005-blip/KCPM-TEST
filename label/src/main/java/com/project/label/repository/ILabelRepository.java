package com.project.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.project.label.entity.Label;
@Repository
public interface ILabelRepository extends JpaRepository<Label, String> {

}
