package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    private String userId;
    private String title;
    private String message;
    private String type; 
    private boolean isRead;
    private LocalDateTime createdAt;
    private LocalDateTime readAt;
    private String relatedId;
    private String relatedType; 
}