package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "admins")
public class Admin {
    @Id
    private String id;
    
    @Indexed(unique = true)
    private String username;
    
    private String password;
    private String fullName;
    private String email;
    private String phone;
    private String role; 
    private LocalDateTime createdAt;
    private LocalDateTime lastLoginAt;
    private String avatar;
    private String notes;
    
    public Admin() {
        this.createdAt = LocalDateTime.now();
        this.role = "admin";
    }
    
    public Admin(String username, String password, String fullName, String email) {
        this();
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
    }
}
