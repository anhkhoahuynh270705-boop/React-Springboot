package com.example.demo.service;

import java.time.Instant;
import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.example.demo.exception.BadRequestException;
import com.example.demo.model.PaymentOrder;
import com.example.demo.model.Ticket;
import com.example.demo.repository.PaymentOrderRepository;
import com.example.demo.repository.TicketRepository;
import com.example.demo.util.StripeUtils;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;

import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@Service
@RequiredArgsConstructor
public class StripePaymentService {

    private final TicketRepository ticketRepository;
    private final TicketService ticketService;
    private final PaymentOrderRepository paymentOrderRepository;

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
                    frontendUrl + "/payment/cancel");

            Session session = Session.create(params);

            return Map.of(
                    "checkoutUrl", session.getUrl(),
                    "sessionId", session.getId(),
                    "status", "pending");

        } catch (StripeException e) {
            throw new RuntimeException("Create Stripe checkout session failed: " + e.getMessage(), e);
        }
    }

    /* Idempotent booking after Stripe Checkout */
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

        // Verify with Stripe that payment is actually paid
        Session session;
        try {
            session = Session.retrieve(sessionId);
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

        Ticket savedTicket;
        try {
            savedTicket = ticketService.bookTicket(ticket);
        } catch (RuntimeException e) {
            Optional<Ticket> concurrent = ticketRepository.findByStripeSessionId(sessionId);
            if (concurrent.isPresent()) {
                return concurrent.get();
            }
            throw e;
        }

        // Record to payment_orders so Payment Management shows the transaction
        savePaymentOrder(sessionId, session, savedTicket);

        // Push booking success notification to the user
        return savedTicket;
    }

    private void savePaymentOrder(String sessionId, Session session, Ticket ticket) {
        try {
            boolean alreadyRecorded = paymentOrderRepository.findAll().stream()
                    .anyMatch(o -> sessionId.equals(o.getOrderId()));
            if (alreadyRecorded) {
                return;
            }
            long amountVnd = session.getAmountTotal() != null
                    ? session.getAmountTotal()
                    : (long) ticket.getPrice();

            String orderInfo = buildOrderInfo(session, ticket);
            String userId = ticket.getUserId();
            String userName = ticket.getUserName() != null ? ticket.getUserName() : userId;
            String userEmail = ticket.getUserEmail() != null ? ticket.getUserEmail() : "";

            PaymentOrder order = new PaymentOrder(
                    sessionId,
                    amountVnd,
                    orderInfo,
                    "creditcard",
                    "paid",
                    Instant.now(),
                    userId,
                    userName,
                    userEmail);
            paymentOrderRepository.save(order);
            log.info("[Stripe] PaymentOrder saved for session={}", sessionId);

        } catch (Exception e) {
            log.warn("[Stripe] Failed to save PaymentOrder for session={}: {}", sessionId, e.getMessage());
        }
    }

    private String buildOrderInfo(Session session, Ticket ticket) {
        // Prefer the description Stripe has on the session
        if (session.getClientReferenceId() != null && !session.getClientReferenceId().isBlank()) {
            return session.getClientReferenceId();
        }
        // Fall back to ticket details
        StringBuilder sb = new StringBuilder("Credit card – ");
        if (ticket.getMovieTitle() != null)
            sb.append(ticket.getMovieTitle());
        if (ticket.getCinemaName() != null)
            sb.append(" @ ").append(ticket.getCinemaName());
        if (ticket.getShowtimeId() != null)
            sb.append(" [").append(ticket.getShowtimeId()).append("]");
        return sb.toString();
    }
}