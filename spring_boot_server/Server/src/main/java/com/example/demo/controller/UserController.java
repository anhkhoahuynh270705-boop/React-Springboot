package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

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

import com.example.demo.dto.AuthResponse;
import com.example.demo.mapper.UserMapper;
import com.example.demo.model.User;
import com.example.demo.security.JwtService;
import com.example.demo.service.UserService;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;
    private final JwtService jwtService;

    @GetMapping
    public ResponseEntity<List<Map<String, Object>>> getAllUsers() {
        return ResponseEntity.ok(UserMapper.toResponseMapList(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getUserById(@PathVariable String id) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.getUserById(id)));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createUser(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserMapper.toResponseMap(userService.createUser(user)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Map<String, Object>> updateUser(@PathVariable String id, @RequestBody User user) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.updateUser(id, user)));
    }

    @PutMapping("/{id}/avatar")
    public ResponseEntity<Map<String, Object>> updateAvatar(
            @PathVariable String id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.updateAvatar(id, body)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@RequestBody User user) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(UserMapper.toResponseMap(userService.register(user)));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestParam String username, @RequestParam String password) {
        Optional<User> userOpt = userService.login(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            String token = jwtService.generateToken(user);
            return ResponseEntity.ok(new AuthResponse(token, UserMapper.toResponseMap(user)));
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }

    @GetMapping("/check-username")
    public ResponseEntity<Boolean> checkUsername(@RequestParam String username) {
        return ResponseEntity.ok(userService.checkUsername(username));
    }

    @GetMapping("/check-email")
    public ResponseEntity<Boolean> checkEmail(@RequestParam String email) {
        return ResponseEntity.ok(userService.checkEmail(email));
    }

    @PostMapping("/{id}/update-login")
    public ResponseEntity<Map<String, Object>> updateLastLogin(@PathVariable String id) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.updateLastLogin(id)));
    }

    @GetMapping("/profile")
    public ResponseEntity<Map<String, Object>> getProfile(@RequestParam String userId) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.getProfile(userId)));
    }

    @PutMapping("/profile/{userId}")
    public ResponseEntity<Map<String, Object>> updateProfile(
            @PathVariable String userId,
            @RequestBody User userData) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.updateProfile(userId, userData)));
    }

    @PostMapping("/change-password/{userId}")
    public ResponseEntity<Map<String, Object>> changePassword(
            @PathVariable String userId,
            @RequestBody Map<String, String> passwordData) {
        return ResponseEntity.ok(UserMapper.toResponseMap(userService.changePassword(
                userId,
                passwordData.get("currentPassword"),
                passwordData.get("newPassword"))));
    }

    @PostMapping("/admin/reset-password/{userId}")
    public ResponseEntity<Map<String, Object>> adminResetPassword(
            @PathVariable String userId,
            @RequestBody Map<String, String> passwordData) {
        return ResponseEntity.ok(UserMapper.toResponseMap(
                userService.adminResetPassword(userId, passwordData.get("newPassword"))));
    }

    @PostMapping("/google-login")
    public ResponseEntity<AuthResponse> googleLogin(@RequestBody Map<String, String> googleData) {
        User user = userService.googleLogin(googleData.get("idToken"));
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, UserMapper.toResponseMap(user)));
    }

    @PostMapping("/google-login-legacy")
    public ResponseEntity<AuthResponse> googleLoginLegacy(@RequestBody Map<String, String> googleData) {
        User user = userService.googleLoginLegacy(
                googleData.get("googleId"),
                googleData.get("email"),
                googleData.get("fullName"),
                googleData.get("profilePicture"));
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, UserMapper.toResponseMap(user)));
    }

    @GetMapping("/google-oauth-config")
    public ResponseEntity<Map<String, String>> getGoogleOAuthConfig() {
        return ResponseEntity.ok(userService.getGoogleOAuthConfig());
    }

    @PostMapping("/{id}/register-face")
    public ResponseEntity<Map<String, Object>> registerFace(
            @PathVariable String id,
            @RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Double> faceDescriptor = (List<Double>) request.get("faceDescriptor");
        userService.registerFace(id, faceDescriptor);
        return ResponseEntity.ok(ResponseUtils.success("Face registered successfully"));
    }

    @PostMapping("/verify-face")
    public ResponseEntity<AuthResponse> verifyFace(@RequestBody Map<String, Object> request) {
        @SuppressWarnings("unchecked")
        List<Double> inputDescriptor = (List<Double>) request.get("faceDescriptor");
        User user = userService.verifyFace(inputDescriptor);
        String token = jwtService.generateToken(user);
        return ResponseEntity.ok(new AuthResponse(token, UserMapper.toResponseMap(user)));
    }

    @GetMapping("/{id}/has-face")
    public ResponseEntity<Map<String, Boolean>> hasFace(@PathVariable String id) {
        Map<String, Boolean> response = new HashMap<>();
        response.put("hasFace", userService.hasFace(id));
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}/delete-face")
    public ResponseEntity<Map<String, Object>> deleteFace(@PathVariable String id) {
        userService.deleteFace(id);
        return ResponseEntity.ok(ResponseUtils.success("Face ID disabled successfully"));
    }
}
