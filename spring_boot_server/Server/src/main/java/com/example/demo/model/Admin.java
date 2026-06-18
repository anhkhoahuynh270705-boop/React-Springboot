package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
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

    private String role = "admin";
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime lastLoginAt;
    private String notes;

    public Admin(String username, String password, String fullName, String email) {
        this.username = username;
        this.password = password;
        this.fullName = fullName;
        this.email = email;
    }
}
