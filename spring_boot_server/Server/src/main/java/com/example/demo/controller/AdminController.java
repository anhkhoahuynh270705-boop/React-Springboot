package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.service.AdminAuthService;
import com.example.demo.service.AdminManagementService;
import com.example.demo.service.AdminStatsService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class AdminController {

    private final AdminAuthService adminAuthService;
    private final AdminStatsService adminStatsService;
    private final AdminManagementService adminManagementService;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
        return ResponseEntity.ok(adminAuthService.login(loginData));
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestParam String adminId) {
        return ResponseEntity.ok(adminAuthService.logout(adminId));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String adminId) {
        return ResponseEntity.ok(adminAuthService.getProfile(adminId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(adminStatsService.getStats());
    }

    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getAllTickets() {
        return ResponseEntity.ok(adminManagementService.getAllTickets());
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        return ResponseEntity.ok(adminManagementService.getAllUsers());
    }

    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String userId) {
        return ResponseEntity.ok(adminManagementService.getUserById(userId));
    }

    @GetMapping("/users/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String keyword) {
        return ResponseEntity.ok(adminManagementService.searchUsers(keyword));
    }

    @PostMapping("/users")
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody Map<String, Object> userData) {
        return ResponseEntity.ok(adminManagementService.createUser(userData));
    }

    @PostMapping("/tickets/{ticketId}/status")
    public ResponseEntity<Map<String, Object>> updateTicketStatus(
            @PathVariable String ticketId,
            @RequestBody Map<String, String> statusData) {
        return ResponseEntity.ok(adminManagementService.updateTicketStatus(ticketId, statusData));
    }

    @PutMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> updateUser(
            @PathVariable String userId,
            @RequestBody Map<String, Object> userData) {
        return ResponseEntity.ok(adminManagementService.updateUser(userId, userData));
    }

    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        return ResponseEntity.ok(adminManagementService.deleteUser(userId));
    }
}
