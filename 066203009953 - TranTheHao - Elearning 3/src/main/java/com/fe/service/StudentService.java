package com.fe.service;

import com.fe.pojo.Student;
import com.fe.repository.IStudentRepository;

import java.util.List;

public class StudentService implements IStudentService {

    private final IStudentRepository studentRepository;

    public StudentService(IStudentRepository studentRepository) {
        this.studentRepository = studentRepository;
    }

    @Override
    public Student createStudent(Student student) {
        validateStudentForCreate(student);
        return studentRepository.save(student);
    }

    @Override
    public Student getStudent(Long id) {
        validateId(id);
        return studentRepository.findById(id);
    }

    @Override
    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    @Override
    public Student updateStudent(Student student) {
        validateStudentForUpdate(student);
        if (studentRepository.findById(student.getId()) == null) {
            throw new IllegalArgumentException("Student not found with id: " + student.getId());
        }
        return studentRepository.update(student);
    }

    @Override
    public boolean deleteStudent(Long id) {
        validateId(id);
        return studentRepository.deleteById(id);
    }

    @Override
    public void close() {
        studentRepository.close();
    }

    private void validateStudentForCreate(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student must not be null");
        }
        if (student.getId() != null) {
            throw new IllegalArgumentException("New student must not have an id");
        }
        validateNameAndAge(student);
    }

    private void validateStudentForUpdate(Student student) {
        if (student == null) {
            throw new IllegalArgumentException("Student must not be null");
        }
        if (student.getId() == null) {
            throw new IllegalArgumentException("Student id is required for update");
        }
        validateNameAndAge(student);
    }

    private void validateNameAndAge(Student student) {
        if (student.getName() == null || student.getName().isBlank()) {
            throw new IllegalArgumentException("Student name must not be blank");
        }
        if (student.getAge() <= 0) {
            throw new IllegalArgumentException("Student age must be greater than 0");
        }
    }

    private void validateId(Long id) {
        if (id == null || id <= 0) {
            throw new IllegalArgumentException("Student id must be a positive number");
        }
    }
}
