package com.example.demo.controller;

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

import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
public class UserController {
    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        try {
            List<User> users = userRepository.findAll();
            return ResponseEntity.ok(users);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable String id) {
        try {
            Optional<User> user = userRepository.findById(id);
            if (user.isPresent()) {
                return ResponseEntity.ok(user.get());
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping
    public ResponseEntity<User> createUser(@RequestBody User user) {
        try {
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            if (userRepository.existsByUsername(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            User savedUser = userRepository.save(user);
            savedUser.setPassword(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<User> updateUser(@PathVariable String id, @RequestBody User user) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }

            // Lấy user hiện tại từ database để giữ nguyên password
            Optional<User> existingUserOpt = userRepository.findById(id);
            if (!existingUserOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User existingUser = existingUserOpt.get();
            
            // Chỉ cập nhật các field được gửi lên, giữ nguyên password
            if (user.getUsername() != null) {
                existingUser.setUsername(user.getUsername());
            }
            if (user.getEmail() != null) {
                existingUser.setEmail(user.getEmail());
            }
            if (user.getFullName() != null) {
                existingUser.setFullName(user.getFullName());
            }
            if (user.getPhone() != null) {
                existingUser.setPhone(user.getPhone());
            }
            if (user.getAddress() != null) {
                existingUser.setAddress(user.getAddress());
            }
            if (user.getNotes() != null) {
                existingUser.setNotes(user.getNotes());
            }
            if (user.getAvatar() != null) {
                existingUser.setAvatar(user.getAvatar());
            }
            // Chỉ cập nhật password nếu được gửi lên và không null
            if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
                existingUser.setPassword(user.getPassword());
            }

            User updatedUser = userRepository.save(existingUser);
            updatedUser.setPassword(null); // Chỉ ẩn password trong response
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        try {
            if (!userRepository.existsById(id)) {
                return ResponseEntity.notFound().build();
            }

            userRepository.deleteById(id);
            return ResponseEntity.noContent().build();
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Authentication endpoints
    @PostMapping("/register")
    public ResponseEntity<User> register(@RequestBody User user) {
        try {
            if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
                return ResponseEntity.badRequest().build();
            }
            if (userRepository.existsByUsername(user.getUsername())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }
            if (userRepository.existsByEmail(user.getEmail())) {
                return ResponseEntity.status(HttpStatus.CONFLICT).build();
            }

            User savedUser = userRepository.save(user);
            savedUser.setPassword(null);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestParam String username, @RequestParam String password) {
        try {
            Optional<User> userOpt = userRepository.findByUsernameAndPassword(username, password);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                // Cập nhật thời gian đăng nhập cuối
                user.setLastLoginAt(java.time.LocalDateTime.now());
                userRepository.save(user);
                user.setPassword(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        try {
            boolean exists = userRepository.existsByUsername(username);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        try {
            boolean exists = userRepository.existsByEmail(email);
            return ResponseEntity.ok(exists);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Cập nhật thời gian đăng nhập cuối
    @PostMapping("/{id}/update-login")
    public ResponseEntity<User> updateLastLogin(@PathVariable String id) {
        try {
            Optional<User> userOpt = userRepository.findById(id);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setLastLoginAt(java.time.LocalDateTime.now());
                userRepository.save(user);
                user.setPassword(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Lấy thông tin user profile (có lastLoginAt)
    @GetMapping("/profile")
    public ResponseEntity<User> getProfile(@RequestParam String userId) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                User user = userOpt.get();
                user.setPassword(null);
                return ResponseEntity.ok(user);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Cập nhật thông tin user (cho user tự cập nhật)
    @PutMapping("/profile/{userId}")
    public ResponseEntity<User> updateProfile(@PathVariable String userId, @RequestBody User userData) {
        try {
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            
            // Cập nhật thông tin nếu có
            if (userData.getFullName() != null && !userData.getFullName().trim().isEmpty()) {
                user.setFullName(userData.getFullName());
            }
            if (userData.getEmail() != null && !userData.getEmail().trim().isEmpty()) {
                String newEmail = userData.getEmail();
                // Kiểm tra email trùng lặp (trừ chính user hiện tại)
                if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                    return ResponseEntity.status(HttpStatus.CONFLICT).build();
                }
                user.setEmail(newEmail);
            }
            if (userData.getPhone() != null) {
                user.setPhone(userData.getPhone());
            }
            if (userData.getAddress() != null) {
                user.setAddress(userData.getAddress());
            }
            
            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    // Thay đổi mật khẩu
    @PostMapping("/change-password/{userId}")
    public ResponseEntity<User> changePassword(@PathVariable String userId, @RequestBody Map<String, String> passwordData) {
        try {
            String currentPassword = passwordData.get("currentPassword");
            String newPassword = passwordData.get("newPassword");
            
            if (currentPassword == null || newPassword == null) {
                return ResponseEntity.badRequest().build();
            }
            
            Optional<User> userOpt = userRepository.findById(userId);
            if (!userOpt.isPresent()) {
                return ResponseEntity.notFound().build();
            }
            
            User user = userOpt.get();
            if (!user.getPassword().equals(currentPassword)) {
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
            }
            
            user.setPassword(newPassword);
            User updatedUser = userRepository.save(user);
            updatedUser.setPassword(null);
            return ResponseEntity.ok(updatedUser);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
