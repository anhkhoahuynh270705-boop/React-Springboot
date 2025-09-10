package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "seats")
public class Seat {
    @Id
    private String id;
    private String showtimeId;
    private String seatNumber;
    private String row;
    private int column;
    private boolean booked;
    private String bookedBy; // ID của user đã đặt ghế
    private String bookedAt; // Thời gian đặt ghế
}