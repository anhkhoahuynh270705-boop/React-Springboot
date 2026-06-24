package com.example.demo.model;

import java.time.LocalDateTime;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.CompoundIndexes;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;

@Data
@Document(collection = "tickets")
@CompoundIndexes({
    @CompoundIndex(name = "idx_userId_status", def = "{'userId': 1, 'status': 1}")
})
public class Ticket {
    @Id
    private String id;
    
    @Indexed 
    private String userId;
    
    private String userName;
    private String userEmail;

    @Indexed
    private String showtimeId;

    private String seatId;
    private String seatNumber;
    private String movieId;
    private String movieTitle;
    private String moviePoster;
    private String movieThumbnail;
    private String cinemaName;
    private String cinemaAddress;
    private String showDate;
    private String showTime;
    private double price;
    private String bookingTime;
    private String status;
    private String qrCode;
    private String ticketNumber;
    private String cancellationReason;
    private LocalDateTime cancelledAt;
    private LocalDateTime usedAt;
    private String paymentMethod;
    private String paymentStatus;
    
    @Indexed(unique = true, sparse = true)
    private String stripeSessionId;
    private String notes;
    
    @JsonProperty("isRefundable")
    private boolean isRefundable;
    private double refundAmount;
    private LocalDateTime refundedAt;
    private String refundReason;
}