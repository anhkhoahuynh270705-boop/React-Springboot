package com.example.demo.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
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

import com.example.demo.model.Admin;
import com.example.demo.repository.AdminRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {
    
    @Autowired
    private AdminRepository adminRepository;
    
    @Autowired
    private TicketRepository ticketRepository;
    
    @Autowired
    private UserRepository userRepository;
    
    @PostMapping("/login")
public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> loginData) {
    try {
        String username = loginData.get("username");
        String password = loginData.get("password");
        String adminKey = loginData.get("adminKey");
        
        if (username == null || password == null) {
            return ResponseEntity.badRequest().body(createErrorResponse("Username và password không được để trống"));
        }
        
        if (adminKey == null || adminKey.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(createErrorResponse("Admin key là bắt buộc"));
        }
        
        // Kiểm tra Admin key
        String validAdminKey = "Tyra2508"; 
        if (!validAdminKey.equals(adminKey)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Admin key không hợp lệ"));
        }   
        
        Optional<Admin> adminOpt = adminRepository.findByUsername(username);
        if (!adminOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Tài khoản admin không tồn tại"));
        }
        
        Admin admin = adminOpt.get();
        if (!admin.getPassword().equals(password)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                .body(createErrorResponse("Mật khẩu không đúng"));
        }
        
        admin.setLastLoginAt(LocalDateTime.now());
        adminRepository.save(admin);
        
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", "Đăng nhập thành công");
        response.put("admin", createAdminResponse(admin));
        response.put("token", "admin-token-" + admin.getId());
        
        return ResponseEntity.ok(response);
        
    } catch (Exception e) {
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
            .body(createErrorResponse("Lỗi server: " + e.getMessage()));
    }
}
    
    // Đăng xuất admin
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(@RequestParam String adminId) {
        try {
            Optional<Admin> adminOpt = adminRepository.findById(adminId);
            if (adminOpt.isPresent()) {
                Map<String, Object> response = new HashMap<>();
                response.put("success", true);
                response.put("message", "Đăng xuất thành công");
                return ResponseEntity.ok(response);
            } else {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Admin không tồn tại"));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Lấy thông tin admin hiện tại
    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String adminId) {
        try {
            Optional<Admin> adminOpt = adminRepository.findById(adminId);
            if (!adminOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("admin", createAdminResponse(adminOpt.get()));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Lấy thống kê tổng quan
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        try {
            long totalTickets = ticketRepository.count();
            long totalUsers = userRepository.count();
            long confirmedTickets = ticketRepository.findByStatus("confirmed").size();
            long usedTickets = ticketRepository.findByStatus("used").size();
            long cancelledTickets = ticketRepository.findByStatus("cancelled").size();
            long pendingTickets = ticketRepository.findByStatus("pending").size();

            double totalRevenue = ticketRepository.findAll().stream()
                .filter(ticket -> "confirmed".equals(ticket.getStatus()) || "used".equals(ticket.getStatus()))
                .mapToDouble(ticket -> ticket.getPrice())
                .sum();
            
            Map<String, Object> stats = new HashMap<>();
            stats.put("totalTickets", totalTickets);
            stats.put("totalUsers", totalUsers);
            stats.put("confirmedTickets", confirmedTickets);
            stats.put("usedTickets", usedTickets);
            stats.put("cancelledTickets", cancelledTickets);
            stats.put("pendingTickets", pendingTickets);
            stats.put("totalRevenue", totalRevenue);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("stats", stats);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Lấy tất cả admin (chỉ super admin)
    @GetMapping("/admins")
    public ResponseEntity<Map<String, Object>> getAllAdmins() {
        try {
            List<Admin> admins = adminRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("admins", admins.stream().map(this::createAdminResponse).toArray());
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Lấy danh sách vé
    @GetMapping("/tickets")
    public ResponseEntity<Map<String, Object>> getAllTickets() {
        try {
            List<com.example.demo.model.Ticket> tickets = ticketRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("tickets", tickets);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Lấy danh sách người dùng
    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getAllUsers() {
        try {
            List<com.example.demo.model.User> users = userRepository.findAll();
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Lấy chi tiết người dùng theo ID
    @GetMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String userId) {
        try {
            Optional<com.example.demo.model.User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            com.example.demo.model.User user = userOpt.get();
            user.setPassword(null); // Không trả về password
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("user", user);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Cập nhật thông tin người dùng
    @PutMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String userId, @RequestBody Map<String, Object> userData) {
        try {
            Optional<com.example.demo.model.User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            com.example.demo.model.User user = userOpt.get();
            
            // Cập nhật thông tin nếu có
            if (userData.containsKey("fullName")) {
                user.setFullName((String) userData.get("fullName"));
            }
            if (userData.containsKey("email")) {
                String newEmail = (String) userData.get("email");
                // Kiểm tra email trùng lặp (trừ chính user hiện tại)
                if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.badRequest()
                        .body(createErrorResponse("Email đã tồn tại"));
                }
                user.setEmail(newEmail);
            }
            if (userData.containsKey("phone")) {
                user.setPhone((String) userData.get("phone"));
            }
            if (userData.containsKey("address")) {
                user.setAddress((String) userData.get("address"));
            }
            if (userData.containsKey("notes")) {
                user.setNotes((String) userData.get("notes"));
            }
            
            com.example.demo.model.User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null); // Không trả về password
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật thông tin người dùng thành công");
            response.put("user", updatedUser);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Xóa người dùng
    @DeleteMapping("/users/{userId}")
    public ResponseEntity<Map<String, Object>> deleteUser(@PathVariable String userId) {
        try {
            Optional<com.example.demo.model.User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            userRepository.deleteById(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Xóa người dùng thành công");
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    
    // Tìm kiếm người dùng
    @GetMapping("/users/search")
    public ResponseEntity<Map<String, Object>> searchUsers(@RequestParam String keyword) {
        try {
            List<com.example.demo.model.User> users = userRepository.findAll().stream()
                .filter(user -> 
                    user.getUsername().toLowerCase().contains(keyword.toLowerCase()) ||
                    user.getFullName().toLowerCase().contains(keyword.toLowerCase()) ||
                    user.getEmail().toLowerCase().contains(keyword.toLowerCase())
                )
                .collect(java.util.stream.Collectors.toList());
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("users", users);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Cập nhật trạng thái vé
    @PostMapping("/tickets/{ticketId}/status")
    public ResponseEntity<Map<String, Object>> updateTicketStatus(
            @PathVariable String ticketId, 
            @RequestBody Map<String, String> statusData) {
        try {
            String newStatus = statusData.get("status");
            if (newStatus == null || newStatus.trim().isEmpty()) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Trạng thái không được để trống"));
            }
            
            Optional<com.example.demo.model.Ticket> ticketOpt = ticketRepository.findById(ticketId);
            if (!ticketOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            com.example.demo.model.Ticket ticket = ticketOpt.get();
            ticket.setStatus(newStatus);
            ticketRepository.save(ticket);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Cập nhật trạng thái vé thành công");
            response.put("ticket", ticket);
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    // Tạo admin mới (chỉ super admin)
    @PostMapping("/create")
    public ResponseEntity<Map<String, Object>> createAdmin(@RequestBody Admin adminData) {
        try {

            if (adminRepository.existsByUsername(adminData.getUsername())) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Username đã tồn tại"));
            }
            
            if (adminData.getEmail() != null && adminRepository.existsByEmail(adminData.getEmail())) {
                return ResponseEntity.badRequest()
                    .body(createErrorResponse("Email đã tồn tại"));
            }
            
            Admin newAdmin = new Admin();
            newAdmin.setUsername(adminData.getUsername());
            newAdmin.setPassword(adminData.getPassword());
            newAdmin.setFullName(adminData.getFullName());
            newAdmin.setEmail(adminData.getEmail());
            newAdmin.setPhone(adminData.getPhone());
            newAdmin.setRole(adminData.getRole() != null ? adminData.getRole() : "admin");
            newAdmin.setNotes(adminData.getNotes());
            
            Admin savedAdmin = adminRepository.save(newAdmin);
            
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "Tạo admin thành công");
            response.put("admin", createAdminResponse(savedAdmin));
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(createErrorResponse("Lỗi server: " + e.getMessage()));
        }
    }
    
    private Map<String, Object> createErrorResponse(String message) {
        Map<String, Object> response = new HashMap<>();
        response.put("success", false);
        response.put("message", message);
        return response;
    }
    
    private Map<String, Object> createAdminResponse(Admin admin) {
        Map<String, Object> adminResponse = new HashMap<>();
        adminResponse.put("id", admin.getId());
        adminResponse.put("username", admin.getUsername());
        adminResponse.put("fullName", admin.getFullName());
        adminResponse.put("email", admin.getEmail());
        adminResponse.put("phone", admin.getPhone());
        adminResponse.put("role", admin.getRole());
        adminResponse.put("createdAt", admin.getCreatedAt());
        adminResponse.put("lastLoginAt", admin.getLastLoginAt());
        adminResponse.put("avatar", admin.getAvatar());
        adminResponse.put("notes", admin.getNotes());
        return adminResponse;
    }
}
