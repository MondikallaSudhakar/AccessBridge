package com.community.community.service;

import com.community.community.model.NGO;
import com.community.community.repository.NGORepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class NGOService {

    private final NGORepository ngoRepository;

    public NGO createNGO(NGO ngo) {
        return ngoRepository.save(ngo);
    }

    public NGO updateNGO(Long id, NGO ngoDetails) {
        NGO ngo = getNGOById(id);
        ngo.setName(ngoDetails.getName());
        ngo.setEmail(ngoDetails.getEmail());
        ngo.setPhone(ngoDetails.getPhone());
        ngo.setAddress(ngoDetails.getAddress());
        ngo.setCity(ngoDetails.getCity());
        ngo.setState(ngoDetails.getState());
        ngo.setCountry(ngoDetails.getCountry());
        ngo.setMission(ngoDetails.getMission());
        ngo.setDescription(ngoDetails.getDescription());
        ngo.setWebsiteUrl(ngoDetails.getWebsiteUrl());
        ngo.setLogoUrl(ngoDetails.getLogoUrl());
        ngo.setRegistrationNumber(ngoDetails.getRegistrationNumber());
        ngo.setCampaignHistory(ngoDetails.getCampaignHistory());
        ngo.setSupportProvidedSummary(ngoDetails.getSupportProvidedSummary());
        ngo.setTotalSpend(ngoDetails.getTotalSpend());
            ngo.setMentorshipEnabled(ngoDetails.getMentorshipEnabled());
        return ngoRepository.save(ngo);
    }

    @Transactional(readOnly = true)
    public NGO getNGOById(Long id) {
        return ngoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("NGO not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public NGO getNGOByEmail(String email) {
        return ngoRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("NGO not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public NGO getNGOByRegistrationNumber(String registrationNumber) {
        return ngoRepository.findByRegistrationNumber(registrationNumber)
                .orElseThrow(() -> new RuntimeException("NGO not found with registration number: " + registrationNumber));
    }

    @Transactional(readOnly = true)
    public List<NGO> getAllNGOs() {
        return ngoRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<NGO> getVerifiedNGOs() {
        return ngoRepository.findByVerifiedTrue();
    }

    @Transactional(readOnly = true)
    public List<NGO> getNGOsByCity(String city) {
        return ngoRepository.findByCity(city);
    }

    public void deleteNGO(Long id) {
        if (!ngoRepository.existsById(id)) {
            throw new RuntimeException("NGO not found with id: " + id);
        }
        ngoRepository.deleteById(id);
    }

    public NGO verifyNGO(Long id) {
        NGO ngo = getNGOById(id);
        ngo.setVerified(true);
        return ngoRepository.save(ngo);
    }
}
