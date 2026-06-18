package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "password_reset_tokens")
public class PasswordResetToken {

    @Id
    private String id;
    
    private String token;
    private String userId;
    private LocalDateTime expiryDate;

    public PasswordResetToken(String token, String userId) {
        this.token = token;
        this.userId = userId;
        this.expiryDate = LocalDateTime.now().plusMinutes(15);
    }
}
