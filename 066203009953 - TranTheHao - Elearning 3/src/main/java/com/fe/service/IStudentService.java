package com.fe.service;

import com.fe.pojo.Student;

import java.util.List;

public interface IStudentService {

    Student createStudent(Student student);

    Student getStudent(Long id);

    List<Student> getAllStudents();

    Student updateStudent(Student student);

    boolean deleteStudent(Long id);

    void close();
}
