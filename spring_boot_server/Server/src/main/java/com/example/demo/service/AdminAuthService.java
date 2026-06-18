package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.mapper.AdminMapper;
import com.example.demo.model.Admin;
import com.example.demo.repository.AdminRepository;
import com.example.demo.security.JwtService;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AdminAuthService {

    private final AdminRepository adminRepository;
    private final JwtService jwtService;

    @Value("${admin.secret-key}")
    private String validAdminKey;

    public Map<String, Object> login(Map<String, String> loginData) {
        String username = loginData.get("username");
        String password = loginData.get("password");
        String adminKey = loginData.get("adminKey");

        if (username == null || password == null) {
            throw new BadRequestException("Username and password are required");
        }
        if (adminKey == null || adminKey.trim().isEmpty()) {
            throw new BadRequestException("Admin key is required");
        }
        if (!validAdminKey.equals(adminKey)) {
            throw new UnauthorizedException("Admin key not valid");
        }

        Admin admin = adminRepository.findByUsername(username)
                .orElseThrow(() -> new UnauthorizedException("Admin account does not exist"));

        if (!admin.getPassword().equals(password)) {
            throw new UnauthorizedException("Wrong password");
        }

        admin.setLastLoginAt(LocalDateTime.now());
        adminRepository.save(admin);

        Map<String, Object> response = ResponseUtils.success("Login successful");
        response.put("admin", AdminMapper.toResponseMap(admin));
        response.put("token", jwtService.generateAdminToken(admin));
        return response;
    }

    public Map<String, Object> logout(String adminId) {
        adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", adminId));
        return ResponseUtils.success("Logout successful");
    }

    public Map<String, Object> getProfile(String adminId) {
        Admin admin = adminRepository.findById(adminId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin", "id", adminId));
        return ResponseUtils.success(null, "admin", AdminMapper.toResponseMap(admin));
    }
}
