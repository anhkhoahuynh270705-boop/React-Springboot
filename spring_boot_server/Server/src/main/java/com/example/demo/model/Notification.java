package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

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