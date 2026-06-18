package com.example.demo.config;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.demo.model.Admin;
import com.example.demo.repository.AdminRepository;

import lombok.RequiredArgsConstructor;

@Component
@RequiredArgsConstructor
public class AdminInitializer implements CommandLineRunner {
    private final AdminRepository adminRepository;
    
    // Create a default admin if none exists
    @Override
    public void run(String... args) throws Exception {
        if (adminRepository.count() == 0) {
            Admin defaultAdmin = new Admin();
            defaultAdmin.setUsername("admin");
            defaultAdmin.setPassword("admin123");
            defaultAdmin.setFullName("Administrator");
            defaultAdmin.setEmail("huynhanhkhoa2707@gmail.com");
            defaultAdmin.setPhone("0932082976");
            defaultAdmin.setRole("super_admin");
            defaultAdmin.setNotes("System default admin");
            
            adminRepository.save(defaultAdmin);
            System.out.println("System default admin account: admin / admin123");
        }
    }
}
