package com.aicareer.career_mentor_backend.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.aicareer.career_mentor_backend.entity.Mentor;

public interface MentorRepository extends JpaRepository<Mentor, Long> {

    List<Mentor> findByAvailableTrue();

    List<Mentor> findBySpecializationIgnoreCase(String specialization);
}