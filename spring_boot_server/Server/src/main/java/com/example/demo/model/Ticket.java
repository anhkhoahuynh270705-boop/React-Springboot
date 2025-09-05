package com.example.demo.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.Data;

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
    private String cinemaName;
    private String showDate;
    private String showTime;
    private double price;
    private String bookingTime;
    private String status;
}