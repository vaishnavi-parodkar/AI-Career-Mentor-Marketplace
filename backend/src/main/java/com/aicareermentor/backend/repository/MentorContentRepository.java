package com.aicareermentor.backend.repository;

import com.aicareermentor.backend.entity.MentorContent;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import java.time.Instant;

public interface MentorContentRepository extends JpaRepository<MentorContent, Long> {
    List<MentorContent> findByMentorIdAndApprovedTrue(Long mentorId);
    List<MentorContent> findByMentorId(Long mentorId);
    List<MentorContent> findByApprovedFalse();
}
