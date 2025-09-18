package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.annotation.CreatedDate;

import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {
    @Id
    private String id;
    
    private String userId;
    private String title;
    private String message;
    private String type;
    private Boolean isRead = false;
    private String relatedType;
    
    @CreatedDate
    private LocalDateTime createdAt;
    
    private LocalDateTime readAt;
}