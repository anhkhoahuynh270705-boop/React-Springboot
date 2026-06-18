package com.example.demo.service;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.model.Ticket;
import com.example.demo.repository.TicketRepository;
import com.example.demo.util.StripeUtils;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService;

    @Value("${stripe.secret.key}")
    private String stripeSecretKey;

    @Value("${frontend.url}")
    private String frontendUrl;

    @PostConstruct
    public void init() {
        Stripe.apiKey = stripeSecretKey;
    }

    public Map<String, Object> createCheckoutSession(Map<String, Object> payload) {
        long amount = Long.parseLong(payload.get("amount").toString());
        String orderInfo = String.valueOf(payload.get("orderInfo"));
        String userId = String.valueOf(payload.get("userId"));

        try {
            SessionCreateParams params = StripeUtils.buildVndSessionParams(
                    amount,
                    orderInfo,
                    userId,
                    frontendUrl + "/payment/success?session_id={CHECKOUT_SESSION_ID}",
                    frontendUrl + "/payment/cancel"
            );

            Session session = Session.create(params);

            return Map.of(
                    "checkoutUrl", session.getUrl(),
                    "sessionId", session.getId(),
                    "status", "pending"
            );

        } catch (StripeException e) {
            throw new RuntimeException("Create Stripe checkout session failed: " + e.getMessage(), e);
        }
    }

    /*Idempotent booking after Stripe Checkout*/
    public Ticket confirmBooking(String sessionId, Ticket ticket) {
        if (sessionId == null || sessionId.isBlank()) {
            throw new BadRequestException("Stripe session ID is required");
        }
        if (ticket == null) {
            throw new BadRequestException("Ticket data is required");
        }

        Optional<Ticket> existing = ticketRepository.findByStripeSessionId(sessionId);
        if (existing.isPresent()) {
            return existing.get();
        }

        try {
            Session session = Session.retrieve(sessionId);
            if (!"paid".equals(session.getPaymentStatus())) {
                throw new BadRequestException("Payment is not completed");
            }
        } catch (StripeException e) {
            throw new RuntimeException("Failed to verify Stripe session: " + e.getMessage(), e);
        }

        ticket.setStripeSessionId(sessionId);
        ticket.setPaymentMethod("creditcard");
        ticket.setPaymentStatus("paid");
        if (ticket.getStatus() == null || ticket.getStatus().isBlank()) {
            ticket.setStatus("pending");
        }

        try {
            return ticketService.bookTicket(ticket);
        } catch (RuntimeException e) {
            Optional<Ticket> concurrent = ticketRepository.findByStripeSessionId(sessionId);
            if (concurrent.isPresent()) {
                return concurrent.get();
            }
            throw e;
        }
    }
}