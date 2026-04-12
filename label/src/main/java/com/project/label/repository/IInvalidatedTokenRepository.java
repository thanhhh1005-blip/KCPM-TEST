package com.project.label.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.project.label.entity.InvalidatedToken;

public interface IInvalidatedTokenRepository extends JpaRepository<InvalidatedToken, String>{

}
