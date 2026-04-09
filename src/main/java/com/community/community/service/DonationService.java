package com.community.community.service;

import com.community.community.model.Donation;
import com.community.community.model.Need;
import com.community.community.repository.DonationRepository;
import com.community.community.repository.NeedRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DonationService {

    private final DonationRepository donationRepository;
    private final NeedRepository needRepository;

    public Donation createDonation(Donation donation) {
        Donation savedDonation = donationRepository.save(donation);
        
        // Update need's raised amount if donation is completed
        if ("COMPLETED".equals(donation.getStatus())) {
            updateNeedRaisedAmount(donation.getNeed().getId());
        }
        
        return savedDonation;
    }

    public Donation updateDonationStatus(Long id, String status) {
        Donation donation = getDonationById(id);
        String oldStatus = donation.getStatus();
        donation.setStatus(status);
        
        Donation updatedDonation = donationRepository.save(donation);
        
        // Update need's raised amount if status changed to/from COMPLETED
        if ("COMPLETED".equals(status) || "COMPLETED".equals(oldStatus)) {
            updateNeedRaisedAmount(donation.getNeed().getId());
        }
        
        return updatedDonation;
    }

    @Transactional(readOnly = true)
    public Donation getDonationById(Long id) {
        return donationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Donation not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public List<Donation> getAllDonations() {
        return donationRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Donation> getDonationsByDonorId(Long donorId) {
        return donationRepository.findByDonorId(donorId);
    }

    @Transactional(readOnly = true)
    public List<Donation> getDonationsByNeedId(Long needId) {
        return donationRepository.findByNeedId(needId);
    }

    @Transactional(readOnly = true)
    public List<Donation> getDonationsByStatus(String status) {
        return donationRepository.findByStatus(status);
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalDonationsByNeedId(Long needId) {
        BigDecimal total = donationRepository.getTotalDonationsByNeedId(needId);
        return total != null ? total : BigDecimal.ZERO;
    }

    @Transactional(readOnly = true)
    public BigDecimal getTotalDonationsByDonorId(Long donorId) {
        BigDecimal total = donationRepository.getTotalDonationsByDonorId(donorId);
        return total != null ? total : BigDecimal.ZERO;
    }

    public void deleteDonation(Long id) {
        Donation donation = getDonationById(id);
        Long needId = donation.getNeed().getId();
        
        donationRepository.deleteById(id);
        
        // Update need's raised amount after deletion
        updateNeedRaisedAmount(needId);
    }

    private void updateNeedRaisedAmount(Long needId) {
        Need need = needRepository.findById(needId)
                .orElseThrow(() -> new RuntimeException("Need not found with id: " + needId));
        
        BigDecimal totalRaised = getTotalDonationsByNeedId(needId);
        need.setRaisedAmount(totalRaised);
        
        // Update status if target reached
        if (totalRaised.compareTo(need.getTargetAmount()) >= 0) {
            need.setStatus("COMPLETED");
        }
        
        needRepository.save(need);
    }
}
