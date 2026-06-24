package com.example.demo.dto;

import java.util.List;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Data;

@Data
public class SeatLockRequest {
    @NotBlank(message = "Showtime ID is required")
    private String showtimeId;

    @NotEmpty(message = "Seat IDs are required")
    private List<String> seatIds;

    @NotBlank(message = "User ID is required")
    private String userId;
}