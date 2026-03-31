package com.fe.dao;

import com.fe.pojo.Student;
import jakarta.persistence.EntityManager;
import jakarta.persistence.EntityManagerFactory;
import jakarta.persistence.EntityTransaction;
import jakarta.persistence.Persistence;

import java.util.List;

public class StudentDAO {

    private final EntityManagerFactory entityManagerFactory;

    public StudentDAO() {
        this.entityManagerFactory = Persistence.createEntityManagerFactory("StudentPU");
    }

    public Student saveStudent(Student student) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        EntityTransaction transaction = entityManager.getTransaction();

        try {
            transaction.begin();
            entityManager.persist(student);
            transaction.commit();
            return student;
        } catch (Exception ex) {
            rollbackIfActive(transaction);
            throw new RuntimeException("Failed to save student", ex);
        } finally {
            entityManager.close();
        }
    }

    public List<Student> getAllStudents() {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        try {
            return entityManager.createQuery(
                            "SELECT DISTINCT s FROM Student s LEFT JOIN FETCH s.books",
                            Student.class
                    )
                    .getResultList();
        } catch (Exception ex) {
            throw new RuntimeException("Failed to fetch all students", ex);
        } finally {
            entityManager.close();
        }
    }

    public Student getStudentById(Long id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();

        try {
            List<Student> students = entityManager.createQuery(
                            "SELECT s FROM Student s LEFT JOIN FETCH s.books WHERE s.id = :id",
                            Student.class
                    )
                    .setParameter("id", id)
                    .getResultList();
            return students.isEmpty() ? null : students.get(0);
        } catch (Exception ex) {
            throw new RuntimeException("Failed to fetch student by id: " + id, ex);
        } finally {
            entityManager.close();
        }
    }

    public Student updateStudent(Student student) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        EntityTransaction transaction = entityManager.getTransaction();

        try {
            transaction.begin();
            Student mergedStudent = entityManager.merge(student);
            transaction.commit();
            return mergedStudent;
        } catch (Exception ex) {
            rollbackIfActive(transaction);
            throw new RuntimeException("Failed to update student with id: " + student.getId(), ex);
        } finally {
            entityManager.close();
        }
    }

    public boolean deleteStudent(Long id) {
        EntityManager entityManager = entityManagerFactory.createEntityManager();
        EntityTransaction transaction = entityManager.getTransaction();

        try {
            transaction.begin();
            Student existingStudent = entityManager.find(Student.class, id);
            if (existingStudent == null) {
                transaction.commit();
                return false;
            }
            entityManager.remove(existingStudent);
            transaction.commit();
            return true;
        } catch (Exception ex) {
            rollbackIfActive(transaction);
            throw new RuntimeException("Failed to delete student with id: " + id, ex);
        } finally {
            entityManager.close();
        }
    }

    public void close() {
        if (entityManagerFactory != null && entityManagerFactory.isOpen()) {
            entityManagerFactory.close();
        }
    }

    private void rollbackIfActive(EntityTransaction transaction) {
        if (transaction != null && transaction.isActive()) {
            transaction.rollback();
        }
    }
}
