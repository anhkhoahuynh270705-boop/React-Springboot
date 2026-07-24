package com.example.demo.service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ConflictException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.User;
import com.example.demo.repository.UserRepository;
import com.example.demo.util.FaceDescriptorUtils;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    private final GoogleOAuthService googleOAuthService;

    @Value("${google.client-id}")
    private String googleClientId;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public User getUserById(String id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
    }

    public User createUser(User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new BadRequestException("Username is required");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }
        if (user.getPassword() == null || user.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Password is required");
        }

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new ConflictException("Username is already taken");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new ConflictException("Email is already registered");
        }

        User savedUser = userRepository.save(user);
        savedUser.setPassword(null);
        return savedUser;
    }

    public User updateUser(String id, User user) {
        if (user.getUsername() == null || user.getUsername().trim().isEmpty()) {
            throw new BadRequestException("Username is required");
        }
        if (user.getEmail() == null || user.getEmail().trim().isEmpty()) {
            throw new BadRequestException("Email is required");
        }

        User existingUser = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (user.getUsername() != null) existingUser.setUsername(user.getUsername());
        if (user.getEmail() != null) existingUser.setEmail(user.getEmail());
        if (user.getFullName() != null) existingUser.setFullName(user.getFullName());
        if (user.getPhone() != null) existingUser.setPhone(user.getPhone());
        if (user.getAddress() != null) existingUser.setAddress(user.getAddress());
        if (user.getNotes() != null) existingUser.setNotes(user.getNotes());
        if (user.getAvatar() != null) existingUser.setAvatar(user.getAvatar());
        if (user.getPassword() != null && !user.getPassword().trim().isEmpty()) {
            existingUser.setPassword(user.getPassword());
        }

        User updatedUser = userRepository.save(existingUser);
        updatedUser.setPassword(null);
        return updatedUser;
    }

    public User updateAvatar(String id, Map<String, Object> body) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        if (body.containsKey("avatar")) {
            Object v = body.get("avatar");
            user.setAvatar(v == null || "".equals(v) ? null : v.toString());
        }

        User updatedUser = userRepository.save(user);
        updatedUser.setPassword(null);
        return updatedUser;
    }

    public void deleteUser(String id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", "id", id);
        }
        userRepository.deleteById(id);
    }

    public User register(User user) {
        return createUser(user); // Reuse logic
    }

    public Optional<User> login(String username, String password) {
        Optional<User> userOpt = userRepository.findByUsernameAndPassword(username, password);
        if (userOpt.isPresent()) {
            User user = userOpt.get();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            user.setPassword(null);
        }
        return userOpt;
    }

    public boolean checkUsername(String username) {
        return userRepository.existsByUsername(username);
    }

    public boolean checkEmail(String email) {
        return userRepository.existsByEmail(email);
    }

    public User updateLastLogin(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);
        user.setPassword(null);
        return user;
    }

    public User getProfile(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setPassword(null);
        return user;
    }

    public User updateProfile(String userId, User userData) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (userData.getFullName() != null && !userData.getFullName().trim().isEmpty()) {
            user.setFullName(userData.getFullName());
        }
        if (userData.getEmail() != null && !userData.getEmail().trim().isEmpty()) {
            String newEmail = userData.getEmail();
            if (!user.getEmail().equals(newEmail) && userRepository.existsByEmail(newEmail)) {
                throw new BadRequestException("Email is already in use");
            }
            user.setEmail(newEmail);
        }
        if (userData.getPhone() != null) user.setPhone(userData.getPhone());
        if (userData.getAddress() != null) user.setAddress(userData.getAddress());

        User updatedUser = userRepository.save(user);
        updatedUser.setPassword(null);
        return updatedUser;
    }

    public User changePassword(String userId, String currentPassword, String newPassword) {
        if (currentPassword == null || newPassword == null) {
            throw new BadRequestException("Passwords cannot be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (!user.getPassword().equals(currentPassword)) {
            throw new UnauthorizedException("Current password is incorrect");
        }

        user.setPassword(newPassword);
        User updatedUser = userRepository.save(user);
        updatedUser.setPassword(null);
        return updatedUser;
    }

    public User adminResetPassword(String userId, String newPassword) {
        if (newPassword == null || newPassword.trim().isEmpty()) {
            throw new BadRequestException("New password cannot be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));
        user.setPassword(newPassword);
        User updatedUser = userRepository.save(user);
        updatedUser.setPassword(null);
        return updatedUser;
    }

    public User googleLogin(String idToken) {
        if (idToken == null || idToken.trim().isEmpty()) {
            throw new BadRequestException("ID token is required");
        }

        GoogleOAuthService.GoogleUserInfo googleUserInfo = googleOAuthService.verifyAndExtractUserInfo(idToken);
        if (googleUserInfo == null) {
            throw new UnauthorizedException("Google token verification failed");
        }

        String googleId = googleUserInfo.getGoogleId();
        String email = googleUserInfo.getEmail();
        String fullName = googleUserInfo.getName();
        String profilePicture = googleUserInfo.getPictureUrl();

        return handleGoogleUser(googleId, email, fullName, profilePicture);
    }


    private User handleGoogleUser(String googleId, String email, String fullName, String profilePicture) {
        Optional<User> existingUser = userRepository.findByGoogleId(googleId);
        if (existingUser.isPresent()) {
            User user = existingUser.get();
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            user.setPassword(null);
            return user;
        }

        Optional<User> emailUser = userRepository.findByEmail(email);
        if (emailUser.isPresent()) {
            User user = emailUser.get();
            user.setGoogleId(googleId);
            user.setProvider("google");
            user.setLastLoginAt(LocalDateTime.now());
            userRepository.save(user);
            user.setPassword(null);
            return user;
        }

        User newUser = new User(googleId, fullName, email);
        if (profilePicture != null && !profilePicture.isEmpty()) {
            newUser.setAvatar(profilePicture);
        }
        newUser.setLastLoginAt(LocalDateTime.now());

        User savedUser = userRepository.save(newUser);
        savedUser.setPassword(null);
        return savedUser;
    }

    public Map<String, String> getGoogleOAuthConfig() {
        Map<String, String> config = new HashMap<>();
        config.put("clientId", googleClientId);
        return config;
    }

    // Face Recognition
    public void registerFace(String id, List<Double> faceDescriptor) {
        if (faceDescriptor == null || faceDescriptor.isEmpty()) {
            throw new BadRequestException("Face descriptor cannot be empty");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setFaceDescriptor(faceDescriptor);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public User verifyFace(List<Double> inputDescriptor) {
        if (inputDescriptor == null || inputDescriptor.isEmpty()) {
            throw new BadRequestException("Face descriptor cannot be empty");
        }

        List<User> allUsers = userRepository.findByFaceDescriptorExists(true);
        User matchedUser = null;
        double bestSimilarity = 0.0;

        // Delegate vector math to FaceDescriptorUtils
        List<Double> normalizedInput = FaceDescriptorUtils.normalize(inputDescriptor);

        for (User user : allUsers) {
            if (user.getFaceDescriptor() != null && !user.getFaceDescriptor().isEmpty()) {
                List<Double> normalizedStored = FaceDescriptorUtils.normalize(user.getFaceDescriptor());
                double similarity = FaceDescriptorUtils.cosineSimilarity(normalizedInput, normalizedStored);

                if (similarity > bestSimilarity) {
                    bestSimilarity = similarity;
                    matchedUser = user;
                }
            }
        }

        if (matchedUser != null && bestSimilarity > FaceDescriptorUtils.SIMILARITY_THRESHOLD) {
            matchedUser.setLastLoginAt(LocalDateTime.now());
            userRepository.save(matchedUser);
            matchedUser.setPassword(null);
            return matchedUser;
        } else {
            throw new UnauthorizedException("Face does not match any registered user");
        }
    }

    public boolean hasFace(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        return user.getFaceDescriptor() != null && !user.getFaceDescriptor().isEmpty();
    }

    public void deleteFace(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));
        user.setFaceDescriptor(null);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }
}
