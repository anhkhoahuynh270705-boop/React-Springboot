package com.example.demo.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import com.example.demo.model.ChatMessage;
import com.example.demo.repository.ChatMessageRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class ChatService {

    @Value("${openrouter.api.key}")
    private String apiKey;

    private final ChatMessageRepository chatRepo;
    
    private final RestTemplate restTemplate = new RestTemplate();

    public List<ChatMessage> getAllMessages() {
        return chatRepo.findAll();
    }
    public List<ChatMessage> getMessageByUserId(String userId){
        return chatRepo.findByUserIdOrderByCreatedAtAsc(userId);
    }

    @SuppressWarnings({ "unchecked", "rawtypes", "UseSpecificCatch" })
    public String processUserMessage(String userId, String userMessage) {
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return "Please enter a valid message.";
        }
        chatRepo.save(new ChatMessage(userId,"user", userMessage));

        try {
            String apiUrl = "https://openrouter.ai/api/v1/chat/completions";
            // Prepare the request payload


            List<Map<String, Object>> messages = new ArrayList<>();
            messages.add(Map.of(
                "role", "system", 
                "content", """
                You are a helpful AI assistant like ChatGPT Plus.
                Always answer in the same language as the user's latest message.
                If the user's latest message is in Vietnamese, answer in Vietnamese.
                If the user's latest message is in English, answer in English.
                You can answer general questions, programming questions, study questions, and movie-related questions.
                If the question is about movies, answer like a cinema assistant.
                Keep the answer clear and easy to understand.
                """
                ));
            
                List<ChatMessage> history = chatRepo.findTop20ByOrderByCreatedAtDesc();
                Collections.reverse(history);
                for (ChatMessage msg : history) {
                    String role = "user".equals(msg.getSender()) ? "user" : "assistant";
                    messages.add(Map.of(
                        "role", role,
                        "content", msg.getMessage()
                    ));
                }

            Map<String, Object> body = new HashMap<>();
            body.put("model", "openrouter/auto");
            body.put("messages", messages);
            body.put("temperature", 0.7);
            body.put("max_tokens", 800);
            

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setBearerAuth(apiKey);
            headers.set("HTTP-Referer", "http://localhost:8080");
            headers.set("X-Title", "Movie Chat");

            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(body, headers);

            ResponseEntity<Map> response = restTemplate.exchange(apiUrl, HttpMethod.POST, entity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK) {
                Map<String, Object> bodyMap = response.getBody();

                if (bodyMap != null && bodyMap.containsKey("choices")) {
                    List<Map<String, Object>> choices = (List<Map<String, Object>>) bodyMap.get("choices");

                    if (!choices.isEmpty()) {
                        Map<String, Object> message = (Map<String, Object>) choices.get(0).get("message");
                        String reply = (String) message.get("content");

                        chatRepo.save(new ChatMessage(userId, "bot", reply));
                        return reply;
                    }
                }
            }
        } catch (Exception e) {
             e.printStackTrace();
            return "ERROR: " + e.getMessage();
        }
        return "Sorry, I don't understand your question.";
    }

}
