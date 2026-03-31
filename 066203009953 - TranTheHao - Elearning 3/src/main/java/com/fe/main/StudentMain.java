package com.fe.main;

import com.fe.dao.StudentDAO;
import com.fe.pojo.Book;
import com.fe.pojo.Student;
import com.fe.repository.IStudentRepository;
import com.fe.repository.StudentRepository;
import com.fe.service.IStudentService;
import com.fe.service.StudentService;

import java.util.List;

public class StudentMain {

    public static void main(String[] args) {
        StudentDAO studentDAO = new StudentDAO();
        IStudentRepository studentRepository = new StudentRepository(studentDAO);
        IStudentService studentService = new StudentService(studentRepository);

        try {
            Student newStudent = new Student("Alice Nguyen", 21);
            newStudent.addBook(new Book("Clean Code", "Robert C. Martin"));
            newStudent.addBook(new Book("Effective Java", "Joshua Bloch"));

            Student createdStudent = studentService.createStudent(newStudent);
            System.out.println("Created student: " + createdStudent);

            System.out.println("\nAll students after create:");
            printStudents(studentService.getAllStudents());

            Student studentToUpdate = studentService.getStudent(createdStudent.getId());
            if (studentToUpdate != null) {
                studentToUpdate.setName("Alice Tran");
                studentToUpdate.setAge(22);
                studentToUpdate.addBook(new Book("Hibernate Tips", "Thorben Janssen"));

                Student updatedStudent = studentService.updateStudent(studentToUpdate);
                System.out.println("\nUpdated student: " + updatedStudent);
            }

            System.out.println("\nAll students after update:");
            printStudents(studentService.getAllStudents());

            boolean deleted = studentService.deleteStudent(createdStudent.getId());
            System.out.println("\nDeleted student id " + createdStudent.getId() + ": " + deleted);

            System.out.println("\nAll students after delete:");
            printStudents(studentService.getAllStudents());
        } catch (Exception ex) {
            System.err.println("Application error: " + ex.getMessage());
            ex.printStackTrace();
        } finally {
            studentService.close();
        }
    }

    private static void printStudents(List<Student> students) {
        if (students == null || students.isEmpty()) {
            System.out.println("No students found.");
            return;
        }

        for (Student student : students) {
            System.out.println(student);
            if (student.getBooks() != null && !student.getBooks().isEmpty()) {
                for (Book book : student.getBooks()) {
                    System.out.println("  - " + book);
                }
            }
        }
    }
}
