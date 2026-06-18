package com.example.demo.controller;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.ChatMessage;
import com.example.demo.service.ChatService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/chat")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/history")
    public List<ChatMessage> getHistory(@RequestParam String userId) {
        return chatService.getMessageByUserId(userId);
    }

    @PostMapping
    public Map<String, Object> chat(@RequestBody Map<String, String> request) {
        String userId = request.get("userId");
        String message = request.get("message");

        String reply = chatService.processUserMessage(userId, message);

        Map<String, Object> result = new HashMap<>();
        result.put("reply", reply);
        return result;
    }

}