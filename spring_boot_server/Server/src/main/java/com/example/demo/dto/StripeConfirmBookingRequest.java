package com.example.demo.dto;

import com.example.demo.model.Ticket;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class StripeConfirmBookingRequest {
    @NotBlank(message = "Stripe session ID is required")
    private String sessionId;

    @NotNull(message = "Ticket data is required")
    @Valid
    private Ticket ticket;
}
