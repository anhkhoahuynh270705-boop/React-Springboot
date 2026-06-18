package com.example.demo.controller;

import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.dto.StripeConfirmBookingRequest;
import com.example.demo.model.Ticket;
import com.example.demo.service.StripePaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/stripe")
@CrossOrigin(origins = "*")
@RequiredArgsConstructor
public class StripePaymentController {

    private final StripePaymentService stripePaymentService;

    // Create a Stripe Checkout Session and return the redirect URL
    @PostMapping("/create-checkout-session")
    public Map<String, Object> createCheckoutSession(@RequestBody Map<String, Object> payload) {
        return stripePaymentService.createCheckoutSession(payload);
    }

    // Confirm booking after successful Stripe payment
    @PostMapping("/confirm-booking")
    public ResponseEntity<Ticket> confirmBooking(@RequestBody StripeConfirmBookingRequest body) {
        return ResponseEntity.ok(stripePaymentService.confirmBooking(body.getSessionId(), body.getTicket()));
    }
}