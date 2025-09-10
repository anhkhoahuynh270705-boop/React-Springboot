package com.example.demo.config;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.demo.model.Admin;
import com.example.demo.repository.AdminRepository;

@Component
public class AdminInitializer implements CommandLineRunner {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Override
    public void run(String... args) throws Exception {
        // Kiểm tra xem đã có admin chưa
        if (adminRepository.count() == 0) {
            // Tạo admin mặc định
            Admin defaultAdmin = new Admin();
            defaultAdmin.setUsername("admin");
            defaultAdmin.setPassword("admin123");
            defaultAdmin.setFullName("Administrator");
            defaultAdmin.setEmail("huynhanhkhoa2707@gmail.com");
            defaultAdmin.setPhone("0932082976");
            defaultAdmin.setRole("super_admin");
            defaultAdmin.setNotes("Admin mặc định của hệ thống");
            
            adminRepository.save(defaultAdmin);
            System.out.println("Đã tạo admin mặc định: admin / admin123");
        }
    }
}
