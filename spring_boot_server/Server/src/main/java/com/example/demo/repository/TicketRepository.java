package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.demo.model.Ticket;

public interface TicketRepository extends MongoRepository<Ticket, String> {
    Optional<Ticket> findByStripeSessionId(String stripeSessionId);
    List<Ticket> findByUserId(String userId);
    List<Ticket> findByStatus(String status);
    List<Ticket> findByShowtimeId(String showtimeId);
    List<Ticket> findByUserIdAndStatus(String userId, String status);
    List<Ticket> findByUserIdOrderByBookingTimeDesc(String userId);
}