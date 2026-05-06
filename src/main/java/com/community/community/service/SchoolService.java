package com.community.community.service;

import com.community.community.model.School;
import com.community.community.repository.SchoolRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SchoolService {

    private final SchoolRepository schoolRepository;

    public School createSchool(School school) {
        return schoolRepository.save(school);
    }

    public School updateSchool(Long id, School schoolDetails) {
        School school = getSchoolById(id);
        school.setName(schoolDetails.getName());
        school.setEmail(schoolDetails.getEmail());
        school.setPhone(schoolDetails.getPhone());
        school.setAddress(schoolDetails.getAddress());
        school.setCity(schoolDetails.getCity());
        school.setState(schoolDetails.getState());
        school.setCountry(schoolDetails.getCountry());
        school.setDescription(schoolDetails.getDescription());
        school.setWebsiteUrl(schoolDetails.getWebsiteUrl());
        school.setLogoUrl(schoolDetails.getLogoUrl());
        school.setSpecialSchool(schoolDetails.getSpecialSchool() != null && schoolDetails.getSpecialSchool());
        school.setDisabilityTypes(schoolDetails.getDisabilityTypes());
        school.setMentorshipEnabled(schoolDetails.getMentorshipEnabled());
        return schoolRepository.save(school);
    }

    @Transactional(readOnly = true)
    public School getSchoolById(Long id) {
        return schoolRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("School not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public School getSchoolByEmail(String email) {
        return schoolRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("School not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public List<School> getAllSchools() {
        return schoolRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<School> getVerifiedSchools() {
        return schoolRepository.findByVerifiedTrue();
    }

    @Transactional(readOnly = true)
    public List<School> getSchoolsByCity(String city) {
        return schoolRepository.findByCity(city);
    }

    @Transactional(readOnly = true)
    public List<School> getSchoolsByState(String state) {
        return schoolRepository.findByState(state);
    }

    public void deleteSchool(Long id) {
        if (!schoolRepository.existsById(id)) {
            throw new RuntimeException("School not found with id: " + id);
        }
        schoolRepository.deleteById(id);
    }

    public School verifySchool(Long id) {
        School school = getSchoolById(id);
        school.setVerified(true);
        return schoolRepository.save(school);
    }
}
