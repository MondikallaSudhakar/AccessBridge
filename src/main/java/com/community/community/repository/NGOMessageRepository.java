package com.community.community.repository;

import com.community.community.model.NGOMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NGOMessageRepository extends JpaRepository<NGOMessage, Long> {
    List<NGOMessage> findByNgoIdOrderByCreatedAtAsc(Long ngoId);
    List<NGOMessage> findByNgoIdAndSenderIdOrderByCreatedAtAsc(Long ngoId, Long senderId);

    @Query("""
            SELECT m FROM NGOMessage m
            WHERE m.ngo.id = :ngoId
            AND (m.sender.id = :userId OR (m.recipient IS NOT NULL AND m.recipient.id = :userId))
            ORDER BY m.createdAt ASC
            """)
    List<NGOMessage> findConversationForUser(@Param("ngoId") Long ngoId, @Param("userId") Long userId);

    Optional<NGOMessage> findFirstByNgoIdAndSenderRoleNotOrderByCreatedAtDesc(Long ngoId, String senderRole);
}
