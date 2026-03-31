package com.fe.repository;

import com.fe.pojo.Student;

import java.util.List;

public interface IStudentRepository {

    Student save(Student student);

    Student findById(Long id);

    List<Student> findAll();

    Student update(Student student);

    boolean deleteById(Long id);

    void close();
}
