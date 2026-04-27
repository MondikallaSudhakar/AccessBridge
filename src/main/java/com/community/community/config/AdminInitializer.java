package com.community.community.config;

import com.community.community.model.Role;
import com.community.community.model.User;
import com.community.community.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        if (!userRepository.existsByEmail("admin@community.com")) {
            User admin = new User();
            admin.setName("Super Admin");
            admin.setEmail("admin@community.com");
            admin.setPassword(passwordEncoder.encode("admin")); // Default password
            admin.setRole(Role.SUPER_ADMIN);
            admin.setPhone("1234567890");
            admin.setStatus("APPROVED");
            admin.setActive(true);
            userRepository.save(admin);
            System.out.println("Default Super Admin created: admin@community.com / admin");
        }
    }
}