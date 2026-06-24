package com.example.demo.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingConfirmationEmailDto {
    private String to;
    private String userName;
    private String ticketNumber;
    private String movieTitle;
    private String moviePoster;
    private String cinemaName;
    private String cinemaAddress;
    private String showDate;
    private String showTime;
    private String seatNumber;
    private String paymentMethod;
    private double totalPrice;
    private String qrCode;
}
