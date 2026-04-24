package com.community.community.controller;

import com.community.community.dto.ProfileUpdateRequest;
import com.community.community.model.User;
import com.community.community.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserProfileController {

    private final UserService userService;

    @PutMapping("/profile/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> updateProfile(@PathVariable Long id, @RequestBody ProfileUpdateRequest request) {
        User user = new User();
        user.setName(request.getName());
        user.setPhone(request.getPhone());
        user.setBio(request.getBio());
        user.setDisabilityType(request.getDisabilityType());
        user.setSkills(request.getSkills());
        user.setSupportNeeds(request.getSupportNeeds());
        user.setDependentName(request.getDependentName());
        user.setDependentRelation(request.getDependentRelation());
        user.setDependentAge(request.getDependentAge());
        user.setDependentNeeds(request.getDependentNeeds());
        user.setProfileImage(request.getProfileImage());
        return ResponseEntity.ok(userService.updateUser(id, user));
    }

    @GetMapping("/profile/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<User> getProfile(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }
}