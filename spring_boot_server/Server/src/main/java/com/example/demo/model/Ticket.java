package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.Data;
import java.time.LocalDateTime;

@Data
@Document(collection = "tickets")
public class Ticket {
    @Id
    private String id;
    private String userId;
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
    private String notes;
    
    @JsonProperty("isRefundable")
    private boolean isRefundable;
    private double refundAmount;
    private LocalDateTime refundedAt;
    private String refundReason;
}