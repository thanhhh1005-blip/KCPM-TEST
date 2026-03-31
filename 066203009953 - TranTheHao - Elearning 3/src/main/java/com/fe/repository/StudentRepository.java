package com.fe.repository;

import com.fe.dao.StudentDAO;
import com.fe.pojo.Student;

import java.util.List;

public class StudentRepository implements IStudentRepository {

    private final StudentDAO studentDAO;

    public StudentRepository(StudentDAO studentDAO) {
        this.studentDAO = studentDAO;
    }

    @Override
    public Student save(Student student) {
        return studentDAO.saveStudent(student);
    }

    @Override
    public Student findById(Long id) {
        return studentDAO.getStudentById(id);
    }

    @Override
    public List<Student> findAll() {
        return studentDAO.getAllStudents();
    }

    @Override
    public Student update(Student student) {
        return studentDAO.updateStudent(student);
    }

    @Override
    public boolean deleteById(Long id) {
        return studentDAO.deleteStudent(id);
    }

    @Override
    public void close() {
        studentDAO.close();
    }
}
