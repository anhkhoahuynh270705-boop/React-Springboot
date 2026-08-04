package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

@Data
@Document(collection = "seats")
@CompoundIndex(name = "idx_showtimeId_booked", def = "{'showtimeId': 1, 'booked': 1}")
public class Seat {
    @Id
    private String id;

    @Indexed
    private String showtimeId;
    private String seatNumber;
    private String row;
    private int column;

    // For layout purposes
    private int rowIndex;
    private int colIndex;
    private int colSpan = 1;

    private boolean booked;
    private String bookedBy;
    private String bookedAt;

    // Seat type: REGULAR, VIP, COUPLE
    private String seatType = "REGULAR";

    // Price for this seat (in VND)
    private double price = 0.0;

    @Transient
    private String tempLockedBy;
}