package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "contacts")
public class Contact {
    
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String subject;
    private String message;
    private LocalDateTime createdAt = LocalDateTime.now();
    private boolean isRead = false;
    
    public Contact(String name, String email, String phone, String subject, String message) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.subject = subject;
        this.message = message;
        this.createdAt = LocalDateTime.now();
        this.isRead = false;
    }
}

