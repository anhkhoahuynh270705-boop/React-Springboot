package com.example.demo.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.User;
import com.example.demo.model.UserCheckIn;
import com.example.demo.service.UserCheckInService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/checkin")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class UserCheckInController {

    private final UserCheckInService checkInService;

    private String getUserId(Authentication auth) {
        return ((User) auth.getPrincipal()).getId();
    }

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus(Authentication auth) {
        String userId = getUserId(auth);
        boolean checkedIn = checkInService.hasCheckedInToday(userId);
        return ResponseEntity.ok(Map.of("checkedIn", checkedIn));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> checkIn(Authentication auth) {
        String userId = getUserId(auth);
        Map<String, Object> result = checkInService.checkInToday(userId);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/history")
    public ResponseEntity<List<UserCheckIn>> getHistory(Authentication auth) {
        String userId = getUserId(auth);
        List<UserCheckIn> history = checkInService.getCheckInHistory(userId);
        return ResponseEntity.ok(history);
    }
}
