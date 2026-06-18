package com.example.demo.dto;

import java.util.List;

import lombok.Data;

@Data
public class SeatLockRequest {
    private String showtimeId;
    private List<String> seatIds;
    private String userId;
}