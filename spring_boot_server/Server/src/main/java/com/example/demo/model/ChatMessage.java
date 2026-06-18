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
@Document(collection = "chat_messages")
public class ChatMessage {

    @Id
    private String id;
    private String userId;
    private String sender;
    private String message;
    private LocalDateTime createdAt = LocalDateTime.now();

    public ChatMessage(String userId, String sender, String message) {
        this.userId = userId;
        this.sender = sender;
        this.message = message;
    }
}
