package com.community.community.service;

import com.community.community.model.Startup;
import com.community.community.repository.StartupRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class StartupService {

    private final StartupRepository startupRepository;

    public Startup createStartup(Startup startup) {
        return startupRepository.save(startup);
    }

    public Startup updateStartup(Long id, Startup startupDetails) {
        Startup startup = getStartupById(id);
        startup.setName(startupDetails.getName());
        startup.setEmail(startupDetails.getEmail());
        startup.setPhone(startupDetails.getPhone());
        startup.setAddress(startupDetails.getAddress());
        startup.setCity(startupDetails.getCity());
        startup.setState(startupDetails.getState());
        startup.setCountry(startupDetails.getCountry());
        startup.setDescription(startupDetails.getDescription());
        startup.setIndustry(startupDetails.getIndustry());
        startup.setWebsiteUrl(startupDetails.getWebsiteUrl());
        startup.setLogoUrl(startupDetails.getLogoUrl());
        startup.setRegistrationNumber(startupDetails.getRegistrationNumber());
        return startupRepository.save(startup);
    }

    @Transactional(readOnly = true)
    public Startup getStartupById(Long id) {
        return startupRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Startup not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public Startup getStartupByEmail(String email) {
        return startupRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Startup not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public List<Startup> getAllStartups() {
        return startupRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Startup> getVerifiedStartups() {
        return startupRepository.findByVerifiedTrue();
    }

    @Transactional(readOnly = true)
    public List<Startup> getStartupsByIndustry(String industry) {
        return startupRepository.findByIndustry(industry);
    }

    @Transactional(readOnly = true)
    public List<Startup> getStartupsByCity(String city) {
        return startupRepository.findByCity(city);
    }

    public void deleteStartup(Long id) {
        if (!startupRepository.existsById(id)) {
            throw new RuntimeException("Startup not found with id: " + id);
        }
        startupRepository.deleteById(id);
    }

    public Startup verifyStartup(Long id) {
        Startup startup = getStartupById(id);
        startup.setVerified(true);
        return startupRepository.save(startup);
    }
}
