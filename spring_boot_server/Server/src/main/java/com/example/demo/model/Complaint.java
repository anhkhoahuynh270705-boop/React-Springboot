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
@Document(collection = "complaints")
public class Complaint {
    
    @Id
    private String id;
    private String name;
    private String email;
    private String phone;
    private String orderId; // Order/Ticket ID related to complaint
    private String category; // booking, payment, service, other
    private String subject;
    private String description;
    private String status = "pending"; // pending, in_progress, resolved, closed
    private LocalDateTime createdAt = LocalDateTime.now();
    private LocalDateTime updatedAt;
    private String adminResponse;
    private boolean isRead = false;
    
    public Complaint(String name, String email, String phone, String orderId, 
                     String category, String subject, String description) {
        this.name = name;
        this.email = email;
        this.phone = phone;
        this.orderId = orderId;
        this.category = category;
        this.subject = subject;
        this.description = description;
        this.createdAt = LocalDateTime.now();
        this.status = "pending";
        this.isRead = false;
    }
}

