package com.community.community.controller;

import com.community.community.dto.LoginRequest;
import com.community.community.dto.LoginResponse;
import com.community.community.dto.RegisterRequest;
import com.community.community.model.NGO;
import com.community.community.model.Role;
import com.community.community.model.School;
import com.community.community.model.Startup;
import com.community.community.model.User;
import com.community.community.security.JwtUtil;
import com.community.community.service.NGOService;
import com.community.community.service.SchoolService;
import com.community.community.service.StartupService;
import com.community.community.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final SchoolService schoolService;
    private final NGOService ngoService;
    private final StartupService startupService;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Check if email already exists
            if (userService.emailExists(request.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT)
                        .body(createErrorResponse("Email already registered"));
            }

            // Create new user
            User user = new User();
            user.setName(request.getName());
            user.setEmail(request.getEmail());
            user.setPassword(passwordEncoder.encode(request.getPassword())); // Encrypt password
            user.setPhone(request.getPhone());
            user.setRole(request.getRole());
            user.setBio(request.getBio());
            user.setDisabilityType(request.getDisabilityType());
            user.setSkills(request.getSkills());
            user.setSupportNeeds(request.getSupportNeeds());
            user.setDependentName(request.getDependentName());
            user.setDependentRelation(request.getDependentRelation());
            user.setDependentAge(request.getDependentAge());
            user.setDependentNeeds(request.getDependentNeeds());
            user.setActive(true);
            
            // Auto-approve individuals, organizations need manual approval
            if (request.getRole() == Role.USER || request.getRole() == Role.SPECIAL_ABLED_PERSON || request.getRole() == Role.GUARDIAN_CAREGIVER) {
                user.setStatus("APPROVED");
            } else {
                user.setStatus("PENDING");
            }

            User createdUser = userService.createUser(user);

            // Auto-create the organization record from registration data
            try {
                if (request.getRole() == Role.SCHOOL_ADMIN && request.getOrgName() != null) {
                    School school = new School();
                    school.setName(request.getOrgName());
                    school.setEmail(request.getEmail());
                    school.setPhone(request.getPhone());
                    school.setAddress(request.getOrgAddress() != null ? request.getOrgAddress() : "");
                    school.setCity(request.getOrgCity());
                    school.setState(request.getOrgState());
                    school.setCountry(request.getOrgCountry());
                    school.setDescription(request.getOrgDescription());
                    school.setWebsiteUrl(request.getOrgWebsiteUrl());
                    school.setLogoUrl(request.getOrgLogoUrl());
                    school.setVerified(false);
                    schoolService.createSchool(school);
                } else if (request.getRole() == Role.NGO_ADMIN && request.getOrgName() != null) {
                    NGO ngo = new NGO();
                    ngo.setName(request.getOrgName());
                    ngo.setEmail(request.getEmail());
                    ngo.setPhone(request.getPhone());
                    ngo.setAddress(request.getOrgAddress() != null ? request.getOrgAddress() : "");
                    ngo.setCity(request.getOrgCity());
                    ngo.setState(request.getOrgState());
                    ngo.setCountry(request.getOrgCountry());
                    ngo.setDescription(request.getOrgDescription());
                    ngo.setMission(request.getOrgMission());
                    ngo.setRegistrationNumber(request.getOrgRegistrationNumber());
                    ngo.setWebsiteUrl(request.getOrgWebsiteUrl());
                    ngo.setLogoUrl(request.getOrgLogoUrl());
                    ngo.setVerified(false);
                    ngoService.createNGO(ngo);
                } else if (request.getRole() == Role.STARTUP_ADMIN && request.getOrgName() != null) {
                    Startup startup = new Startup();
                    startup.setName(request.getOrgName());
                    startup.setEmail(request.getEmail());
                    startup.setPhone(request.getPhone());
                    startup.setAddress(request.getOrgAddress() != null ? request.getOrgAddress() : "");
                    startup.setCity(request.getOrgCity());
                    startup.setState(request.getOrgState());
                    startup.setCountry(request.getOrgCountry());
                    startup.setDescription(request.getOrgDescription());
                    startup.setIndustry(request.getOrgIndustry());
                    startup.setWebsiteUrl(request.getOrgWebsiteUrl());
                    startup.setLogoUrl(request.getOrgLogoUrl());
                    startup.setRegistrationNumber(request.getOrgRegistrationNumber());
                    startup.setVerified(false);
                    startupService.createStartup(startup);
                }
            } catch (Exception orgEx) {
                // Log but don't fail the user creation if org record fails
                System.err.println("Warning: Could not create org record: " + orgEx.getMessage());
            }

            // Only generate JWT token for APPROVED users
            String token = null;
            if ("APPROVED".equals(createdUser.getStatus())) {
                token = jwtUtil.generateToken(
                        createdUser.getEmail(),
                        createdUser.getId(),
                        createdUser.getRole().name()
                );
            }

            LoginResponse response = new LoginResponse(
                    token,
                    createdUser.getEmail(),
                    createdUser.getId(),
                    createdUser.getRole().name(),
                    createdUser.getStatus().equals("APPROVED") ? "Registration successful" : "Registration successful. Please wait for admin approval before logging in."
            );

            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            // Get user details first to check status
            User user = userService.getUserByEmail(request.getEmail());
            
            if (!"APPROVED".equals(user.getStatus())) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN)
                        .body(createErrorResponse("Your account is pending approval by an admin. Current status: " + user.getStatus()));
            }

            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            request.getEmail(),
                            request.getPassword()
                    )
            );

            // User details already retrieved above for status check

            // Generate JWT token
            String token = jwtUtil.generateToken(
                    user.getEmail(),
                    user.getId(),
                    user.getRole().name()
            );

            LoginResponse response = new LoginResponse(
                    token,
                    user.getEmail(),
                    user.getId(),
                    user.getRole().name(),
                    "Login successful"
            );

            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(createErrorResponse("Invalid email or password"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout() {
        // With JWT, logout is handled client-side by removing the token
        Map<String, String> response = new HashMap<>();
        response.put("message", "Logout successful. Please remove the token from client.");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/profile/{id}")
    public ResponseEntity<?> getUserProfile(@PathVariable Long id) {
        try {
            User user = userService.getUserById(id);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(createErrorResponse(e.getMessage()));
        }
    }

    private Map<String, String> createErrorResponse(String message) {
        Map<String, String> error = new HashMap<>();
        error.put("error", message);
        return error;
    }
}
