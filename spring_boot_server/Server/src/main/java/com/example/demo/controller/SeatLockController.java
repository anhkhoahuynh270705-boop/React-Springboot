package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.SeatLockRequest;
import com.example.demo.service.SeatLockService;
import com.example.demo.util.ResponseUtils;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/seat-locks")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class SeatLockController {

    private final SeatLockService seatLockService;

    // Lock seats
    @PostMapping("/lock")
    public ResponseEntity<Map<String, Object>> lockSeats(@RequestBody SeatLockRequest request) {
        seatLockService.lockSeats(
                request.getShowtimeId(),
                request.getSeatIds(),
                request.getUserId()
        );
        return ResponseEntity.ok(ResponseUtils.success("Seats locked successfully"));
    }

    // Release seat locks
    @PostMapping("/release")
    public ResponseEntity<Map<String, Object>> releaseSeats(@RequestBody SeatLockRequest request) {
        seatLockService.releaseSeats(
                request.getShowtimeId(),
                request.getSeatIds(),
                request.getUserId()
        );
        return ResponseEntity.ok(ResponseUtils.success("Seats released successfully"));
    }
}