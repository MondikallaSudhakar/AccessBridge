package com.community.community.service;

import com.community.community.model.User;
import com.community.community.model.Role;
import com.community.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Transactional
public class UserService {

    private final UserRepository userRepository;

    public User createUser(User user) {
        return userRepository.save(user);
    }

    public User updateUser(Long id, User userDetails) {
        User user = getUserById(id);
        if (userDetails.getName() != null) user.setName(userDetails.getName());
        if (userDetails.getEmail() != null) user.setEmail(userDetails.getEmail());
        if (userDetails.getPhone() != null) user.setPhone(userDetails.getPhone());
        if (userDetails.getBio() != null) user.setBio(userDetails.getBio());
        if (userDetails.getDisabilityType() != null) user.setDisabilityType(userDetails.getDisabilityType());
        if (userDetails.getSkills() != null) user.setSkills(userDetails.getSkills());
        if (userDetails.getSupportNeeds() != null) user.setSupportNeeds(userDetails.getSupportNeeds());
        if (userDetails.getProfileImage() != null) user.setProfileImage(userDetails.getProfileImage());
        if (userDetails.getRole() != null) user.setRole(userDetails.getRole());
        if (userDetails.getActive() != null) user.setActive(userDetails.getActive());
        return userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public User getUserById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + id));
    }

    @Transactional(readOnly = true)
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));
    }

    @Transactional(readOnly = true)
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<User> getUsersByRole(Role role) {
        return userRepository.findByRole(role);
    }

    @Transactional(readOnly = true)
    public List<User> getActiveUsers() {
        return userRepository.findByActiveTrue();
    }

    public void deleteUser(Long id) {
        if (!userRepository.existsById(id)) {
            throw new RuntimeException("User not found with id: " + id);
        }
        userRepository.deleteById(id);
    }

    public void deactivateUser(Long id) {
        User user = getUserById(id);
        user.setActive(false);
        userRepository.save(user);
    }

    @Transactional(readOnly = true)
    public boolean emailExists(String email) {
        return userRepository.existsByEmail(email);
    }

    @Transactional(readOnly = true)
    public List<User> getPendingUsers() {
        return userRepository.findByStatus("PENDING");
    }

    public User approveUser(Long id) {
        User user = getUserById(id);
        user.setStatus("APPROVED");
        return userRepository.save(user);
    }

    public User rejectUser(Long id) {
        User user = getUserById(id);
        user.setStatus("REJECTED");
        return userRepository.save(user);
    }
}
