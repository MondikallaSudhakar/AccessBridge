package com.community.community.service;

import com.community.community.dto.NGOMessageResponse;
import com.community.community.model.NGO;
import com.community.community.model.NGOMessage;
import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.NGOMessageRepository;
import com.community.community.repository.NGORepository;
import com.community.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class NGOMessageService {

    private final NGOMessageRepository ngoMessageRepository;
    private final NGORepository ngoRepository;
    private final UserRepository userRepository;
    private final NGOMessageRealtimeService ngoMessageRealtimeService;

    public NGOMessageResponse sendMessageToNGO(Long ngoId, String senderEmail, String content) {
        if (content == null || content.trim().isEmpty()) {
            throw new RuntimeException("Message content cannot be empty");
        }

        User sender = userRepository.findByEmail(senderEmail)
                .orElseThrow(() -> new RuntimeException("Sender not found"));

        NGO ngo = ngoRepository.findById(ngoId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));

        NGOMessage message = new NGOMessage();
        message.setNgo(ngo);
        message.setSender(sender);
        message.setSenderRole(sender.getRole().name());
        message.setContent(content.trim());

        NGOMessage saved = ngoMessageRepository.save(message);
        NGOMessageResponse response = toResponse(saved);

        Set<String> recipients = new LinkedHashSet<>();
        recipients.add(sender.getEmail());
        recipients.add(ngo.getEmail());
        ngoMessageRealtimeService.broadcastToUsers(recipients, response);

        return response;
    }

    @Transactional(readOnly = true)
    public List<NGOMessageResponse> getMessagesForNGO(Long ngoId, String requesterEmail) {
        User requester = userRepository.findByEmail(requesterEmail)
                .orElseThrow(() -> new RuntimeException("Requester not found"));

        NGO ngo = ngoRepository.findById(ngoId)
                .orElseThrow(() -> new RuntimeException("NGO not found"));

        List<NGOMessage> messages;
        boolean isNgoOwner = requester.getRole() == Role.NGO_ADMIN && requester.getEmail().equalsIgnoreCase(ngo.getEmail());

        if (isNgoOwner) {
            messages = ngoMessageRepository.findByNgoIdOrderByCreatedAtAsc(ngoId);
        } else {
            messages = ngoMessageRepository.findByNgoIdAndSenderIdOrderByCreatedAtAsc(ngoId, requester.getId());
        }

        return messages.stream().map(this::toResponse).toList();
    }

    private NGOMessageResponse toResponse(NGOMessage message) {
        return new NGOMessageResponse(
                message.getId(),
                message.getNgo().getId(),
                message.getSender().getId(),
                message.getSender().getName(),
                message.getSender().getEmail(),
                message.getSenderRole(),
                message.getContent(),
                message.getCreatedAt()
        );
    }
}
