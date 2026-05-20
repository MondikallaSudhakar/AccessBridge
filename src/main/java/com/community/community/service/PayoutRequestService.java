package com.community.community.service;

import com.community.community.dto.PayoutRequestDto;
import com.community.community.model.NGO;
import com.community.community.model.PayoutRequest;
import com.community.community.repository.NGORepository;
import com.community.community.repository.PayoutRequestRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PayoutRequestService {

    private final PayoutRequestRepository payoutRequestRepository;
    private final NGORepository ngoRepository;

    @Transactional
    public PayoutRequestDto createRequest(Long ngoId, BigDecimal amount, String notes) {
        NGO ngo = ngoRepository.findById(ngoId).orElseThrow(() -> new IllegalArgumentException("NGO not found"));

        PayoutRequest req = new PayoutRequest();
        req.setNgo(ngo);
        req.setAmount(amount);
        req.setNotes(notes);
        req.setStatus(PayoutRequest.Status.PENDING);

        PayoutRequest saved = payoutRequestRepository.save(req);
        return PayoutRequestDto.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<PayoutRequestDto> listForNgo(Long ngoId) {
        return payoutRequestRepository.findByNgoIdOrderByCreatedAtDesc(ngoId).stream()
                .map(PayoutRequestDto::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public PayoutRequestDto updateStatus(Long id, PayoutRequest.Status status) {
        PayoutRequest req = payoutRequestRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Payout request not found"));
        req.setStatus(status);
        PayoutRequest saved = payoutRequestRepository.save(req);
        return PayoutRequestDto.fromEntity(saved);
    }

    @Transactional
    public PayoutRequestDto cancelRequest(Long ngoId, Long id) {
        PayoutRequest req = payoutRequestRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Payout request not found"));
        if (!req.getNgo().getId().equals(ngoId)) {
            throw new IllegalArgumentException("Not authorized to cancel this request");
        }
        req.setStatus(PayoutRequest.Status.CANCELLED);
        PayoutRequest saved = payoutRequestRepository.save(req);
        return PayoutRequestDto.fromEntity(saved);
    }
}
