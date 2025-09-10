package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.index.Indexed;

import lombok.Data;
import java.time.LocalDateTime;

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
    private LocalDateTime lastLoginAt;
    private String avatar;
    private String address;
    private String notes;
    
    // Constructor
    public User() {
        this.createdAt = LocalDateTime.now();
    }
    
    public User(String username, String password, String fullName, String email) {
        this();
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
    }
}