package com.example.demo.model;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "users")
public class User {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String password;
    private String fullName;
    
    @Indexed(unique = true)
    private String email;
    private String phone;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lastLoginAt;
    private String avatar;
    private String address;
    private String notes;
    
    // OAuth fields
    private String googleId;
    private String githubId;
    private String avatarUrl;
    private String provider; // "local", "google"
    
    // Face ID fields
    private List<Double> faceDescriptor; 
    
    // Constructor
    public User() {
        this.createdAt = LocalDateTime.now();
    }
    
    public User(String username, String password, String fullName, String email, String provider) {
        this();
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
        this.provider = provider;
    }
    
    // Constructor for Google OAuth users
    public User(String googleId, String fullName, String email) {
        this();
        this.googleId = googleId;
        this.fullName = fullName;
        this.email = email;
        this.provider = "google";
        this.username = email;
    }
    
    // Constructor for GitHub OAuth users
    public User(String githubId, String fullName, String email, String provider) {
        this();
        this.githubId = githubId;
        this.fullName = fullName;
        this.email = email;
        this.provider = provider;
        this.username = email; 
    }
}