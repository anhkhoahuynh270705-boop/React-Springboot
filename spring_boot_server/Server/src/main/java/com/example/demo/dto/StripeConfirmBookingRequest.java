package com.example.demo.dto;

import com.example.demo.model.Ticket;

import lombok.Data;

@Data
public class StripeConfirmBookingRequest {
    private String sessionId;
    private Ticket ticket;
}
